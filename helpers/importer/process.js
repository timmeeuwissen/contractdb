import config from '~/config.json'
import strategize from './strategize'
import dbTemplate from '../dbTemplate'
import connection from '../connection'

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

export default (importerType, importerRecords, methods) => {
  methods = methods || defaultMethods

  const template = dbTemplate();
  const strategy = strategize(importerType);
  const skipKeys = {}
  const keyToField = {}

  // sets up the template recursively
  const setupTemplate = (tableRef, srcKey) => {
    const { column } = strategy.mapping.forward[srcKey]
    // console.log(tableRef, srcKey, strategy.mapping.forward[srcKey])
    // console.log('---------')
    keyToField[srcKey] = tableRef.setField(column)
    
    // in case of a relation
    if(srcKey in strategy.relations.forward) {
      // multiple columns bind to the fields of that target table for that relation
      const {database: fkDatabase, table: fkTable, column: fkColumn} = strategy.relations.forward[srcKey]

      strategy.relations.reverse[fkDatabase][fkTable][fkColumn]
        .forEach(trgKey => {
          if (!(trgKey in skipKeys)) {
            skipKeys[trgKey] = true
            setupTemplate(keyToField[srcKey].setReference({
              database: strategy.mapping.forward[trgKey].database, 
              table: strategy.mapping.forward[trgKey].table, 
            }), trgKey)
          }
        })
    }
    // in case of standard direct mapping
    else {
      if (srcKey in strategy.methods) {
        strategy.methods[srcKey].forEach(method => {
          if(!(method.method in methods)) throw new Error(`Method ${method.method} is not an existing method`)
          keyToField[srcKey].setMethod(methods[method.method], method.mapConf.args)
        })
      }
    }
  }

  strategy.fieldOrder.forEach(srcKey => {
    if (srcKey in skipKeys) return
    const {database, table} = strategy.mapping.forward[srcKey]

    setupTemplate(
      template
        .setDatabase(database)
        .setTable(table),
      srcKey
    )
  })

  const recordCb = async (meta, record) => {
    const keys = Object.keys(record), values = Object.values(record)
    
    const query = `insert into ${meta.database}.${meta.table} (${keys.join(',')}) `+
      `values(${Array(keys.length).fill('?').join(',')}) ` +
      `on duplicate key update ` +
      keys.reduce((acc, key) => ([...acc, `${key} = values(${key})`]), []).join(', ')
    const result = await connection().promise().query(query, values)
    console.log(`InsertID was ${result[0].insertId}`, result, query, values)
    return result[0].insertId
  }

  console.log('starting import')
  connection().beginTransaction()

  // iterate over the flat record to apply it to the database
  importerRecords.forEach(srcRecord => {
    
    // each relevant sourcefield is mapped to a target field which is 
    // a reference to the layered structure within the dbTemplate
    Object.entries(keyToField).forEach(([srcKey, fieldTarget]) => {
      fieldTarget.applyValue(srcRecord[srcKey])
    })

    // trancerse the entire model, including foreign key constraints, and 
    // use the callback to resolve what to do with the records.
    template.applyRecords(recordCb)
  })
  console.log('rolling back')
  connection.rollback()
  console.log('import finished')

}