import config from '~/config.json'
import strategize from './strategize'
import dbTemplate from '../dbTemplate'
import connection from '../connection'
import { deconstructTarget, getAllPrimaryKeys } from '../dbSchema'

// preprocess returns a filled recordConstructor 

const defaultMethods = {
  split: (value, args) => String(value).split(args.pattern),
  conditionalRemap: (value, args) => {
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
      const {database: fkDatabase, table: fkTable, column: fkColumn} = strategy.relations.forward[srcKey]
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
    setupTemplate(
      ( (mapConf?.target && Array.isArray(mapConf.target) && mapConf.target.length == 2) 
        ? template
            .find({...deconstructTarget(mapConf.target[0]), _refSearch: true, _createIfNotSet: true})
            .setReference(deconstructTarget(mapConf.target[1]))
        : template
            .setDatabase(database)
            .setTable(table)
      ),
      srcKey
    )
  })

  return { template, keyToField }
}

export const execute = async (importerType, importerRecords, methods) => {
  const primaryKeys = await getAllPrimaryKeys()
  const { template, keyToField } = getTemplate(importerType, methods)

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
    
    const result = await connection().promise().query(query, values)

    const insertId = result[0].insertId || record[priKey]
    // console.log(`InsertID was ${insertId}`, result, query, values)
    return insertId
  }

  console.log('starting import')
  connection().beginTransaction()

  const allRecords = []

  // iterate over the flat record to apply it to the database
  importerRecords.forEach(srcRecord => {
    
    // each relevant sourcefield is mapped to a target field which is 
    // a reference to the layered structure within the dbTemplate
    Object.entries(keyToField).forEach(([srcKey, fieldTarget]) => {
      allRecords.push(fieldTarget.applyValue(srcRecord[srcKey]))
    })

    // trancerse the entire model, including foreign key constraints, and 
    // use the callback to resolve what to do with the records.
    template.applyRecords(recordCb)
  })

  Promise.all(allRecords)
    .then(_values => {
      console.log('committing input')
      connection().commit()
    })
    .catch(error => {
      console.log('rolling back')
      connection().rollback()
      throw error
    })
  console.log('import finished')

}