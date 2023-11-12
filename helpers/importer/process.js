import strategize from './strategize'
import dbTemplate from '../dbTemplate'
import connection from '../connection'
import { deconstructTarget, getAllPrimaryKeys, getFlags, get_tableDescription } from '../dbSchema'

// preprocess returns a filled recordConstructor 

const defaultMethods = {
  split: (value, args) => String(value).split(args.pattern),
  conditionalRemap: (value, args) => {
    if ('targets' in args && value) {
      args.targets.forEach()
    }
    return value
    // todo : write method, requires access to template?
  },
  boolRemap: (value, args) => {
    if('valuesToTrue' in args && value in args.valuesToTrue) return true
    if('valuesToFalse' in args && value in args.valuesToTrue) return false
    if('default' in args) return args.default
    return null
  }
}

export const getTemplate = (importerType, methods) => {
  methods = methods || defaultMethods

  const skipKeys = {}
  const keyToField = {}
  const template = dbTemplate()
  const strategy = strategize(importerType)

  // sets up the template recursively
  const setupTemplate = (tableRef, srcKey) => {
    const { column } = strategy.mapping.forward[srcKey]
    const properties = { srcKey }
    // console.log(tableRef, srcKey, strategy.mapping.forward[srcKey])
    // in case of a relation
    if((srcKey in strategy.relations.forward) && !(srcKey in skipKeys)) {
      // multiple columns bind to the fields of that target table for that relation
      const {
        database: fkDatabase, 
        table: fkTable, 
        column: fkColumn
      } = strategy.relations.forward[srcKey]
      
      strategy.relations.reverse[fkDatabase][fkTable][fkColumn]
        .forEach(trgKey => {
          if (!(trgKey in skipKeys)) {
            skipKeys[trgKey] = true
            setupTemplate(
              tableRef.find(
                  {
                    ...deconstructTarget(strategy.mapping.forward[trgKey].mapConf.target[0]), 
                    _refSearch: true, 
                    _createIfNotSet: true
                  }
                )
                .setReference({
                  database: strategy.mapping.forward[trgKey].database, 
                  table: strategy.mapping.forward[trgKey].table, 
                }), 
              trgKey)
          }
        })
    }
    // in case of standard direct mapping
    else {
      const field = tableRef.setField(column)
      keyToField[srcKey] = field

      if (srcKey in strategy.methods) {
        strategy.methods[srcKey].forEach(method => {
          if(!(method.method in methods)) throw new Error(`Method ${method.method} is not an existing method`)
          keyToField[srcKey].setMethod(methods[method.method], method.mapConf.args)
        })
      }

      // set some properties to be used to reverse engineer the dbModel
      keyToField[srcKey].setProperties(properties)
    }

  }

  strategy.fieldOrder.forEach(srcKey => {
    if (srcKey in skipKeys) return
    const {database, table, mapConf} = strategy.mapping.forward[srcKey]
    skipKeys[srcKey] = true
    let preppedTemplate = template

    if(mapConf?.target && Array.isArray(mapConf.target)) {
      preppedTemplate = mapConf.target.reduce(
        (acc, target, targIdx) => {
          const searchParams = {
            ...deconstructTarget(target),
            _refSearch: true, 
            _createIfNotSet: true
          }
          if (targIdx == mapConf.target.length - 1) delete searchParams.column
          return acc.find(searchParams)
        }, 
        template
      )
    }
    else {
      preppedTemplate = preppedTemplate.find({ 
        database,
        table,
        _createIfNotSet: true,
        _refSearch: true,
      })
    }

    setupTemplate(
      preppedTemplate,
      srcKey
    )
  })

  return { template, keyToField }
}

export const execute = async (importerType, importerRecords, methods) => {
  const primaryKeys = await getAllPrimaryKeys()
  const { template, keyToField } = getTemplate(importerType, methods)

  const logStatModel = {
    insert: 0,
    update: 0,
    processed: 0,
    errors: []
  }

  const databaseStats = {
    totals: structuredClone(logStatModel),
    perTable: {}
  }

  const logStats = (database, table, result, error) => {
    if (!(database in databaseStats.perTable)) {
      databaseStats.perTable[database] = {}
    }
    if (!(table in databaseStats.perTable[database])){
      databaseStats.perTable[database][table] = structuredClone(logStatModel)
    }

    if (error) {
      databaseStats.totals.errors.push(error)
      databaseStats.perTable[database][table].errors.push(error)
      console.log(database, table, result, error)
      if(result) console.log(getFlags(result.serverStatus), getFlags(result.warningStatus))
      return
    }

    if (result[0].affectedRows) {
      databaseStats.totals.update++
      databaseStats.perTable[database][table].update++
    }

    databaseStats.totals.processed++
    databaseStats.perTable[database][table].processed++
    // console.log(database, table, result, getFlags(result.serverStatus), getFlags(result.warningStatus))

    return
  }

  const recordCb = async (meta, record) => {
    const keys = Object.keys(record), values = Object.values(record)
    const priKey = primaryKeys[meta.database][meta.table]

    if (!priKey) {
      throw new Error('Could not determine primary key for', meta)
    }

    const updateInsertId = priKey in record 
      ? ''
      : `${priKey} = LAST_INSERT_ID(${priKey}), `

    const query = `insert into ${meta.database}.${meta.table} (${keys.join(',')}) `+
      `values(${Array(keys.length).fill('?').join(',')}) ` +
      `on duplicate key update ` +
      updateInsertId +
      keys.reduce((acc, key) => ([...acc, `${key} = values(${key})`]), []).join(', ')
    
    try {
      const result = await connection().promise().query(query, values)
      logStats(meta.database, meta.table, result)
      const insertId = result[0].insertId || record[priKey]
      return insertId
    }
    catch(err) {
      logStats(meta.database, meta.table, null, err)
      return null
    }
  }

  console.log('starting import')
  connection().beginTransaction()

  const allRecords = []

  // iterate over the flat record to apply it to the database
  importerRecords.forEach(srcRecord => {
    
    // each relevant sourcefield is mapped to a target field which is 
    // a reference to the layered structure within the dbTemplate
    Object.entries(keyToField).forEach(([srcKey, fieldTarget]) => {
      fieldTarget.applyValue(srcRecord[srcKey])
    })

    // traverse the entire model, including foreign key constraints, and 
    // use the callback to resolve what to do with the records.
    allRecords.push(template.applyRecords(recordCb))
  })

  try {
    await Promise.all(allRecords)
    console.log('committing input')
    connection().commit()
  }
  catch(err) {
    console.log('rolling back', err.message)
    connection().rollback()
    throw err
  }

  console.log('import finished', databaseStats)
  return databaseStats
}