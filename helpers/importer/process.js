import config from '~/config.json'
import strategize from './strategize'
import dbTemplate from '../dbTemplate'

// preprocess returns a filled recordConstructor 

export default (importerType, importerRecords, methods) => {
  methods = methods || {
    split: (value, args) => String(value).split(args.pattern)
  }

  const template = dbTemplate();
  const strategy = strategize(importerType);
  const skipKeys = {}
  const keyToField = {}

  // sets up the template recursively
  const setupTemplate = (tableRef, srcKey) => {
    const { column } = strategy.mapping.forward[srcKey]
    
    keyToField[srcKey] = tableRef.setField(column)
    
    // in case of a relation
    if(srcKey in strategy.relations.forward) {
      // multiple columns bind to the fields of that target table for that relation
      const {database: fkDatabase, table: fkTable, column: fkColumn} = strategy.relations.forward[srcKey]

      strategy.relations.reverse[fkDatabase][fkTable][fkColumn]
        .forEach(srcKey => {
          if (!(srcKey in skipKeys)) {
            skipKeys[srcKey] = true
            setupTemplate(tableRef, srcKey)
          }
        })
    }
    // in case of standard direct mapping
    else {
      if (srcKey in strategy.methods) {
        strategy.methods[srcKey].forEach(method => tableRef.setMethod(method.method, method.mapConf.method.args))
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

  const recordCb = (meta, record) => {
    console.log(`intending to insert into ${meta} with record ${record}`)
  }

  console.log('looping over', importerRecords)
  // iterate over the flat record to apply it to the database
  importerRecords.forEach(srcRecord => {
    console.log(`Importing record ${srcRecord}`)
    // each relevant sourcefield is mapped to a target field which is 
    // a reference to the layered structure within the dbTemplate
    Object.entries(keyToField).forEach((srcKey, fieldTarget) => {
      fieldTarget.applyValue(srcRecord[srcKey])
    })

    // trancerse the entire model, including foreign key constraints, and 
    // use the callback to resolve what to do with the records.
    template.applyRecords(recordCb)
  })

}