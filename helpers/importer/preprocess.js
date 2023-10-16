import config from '~/config.json'
import strategize from './strategize'
import recordConstructor from './recordConstructor'



export default (importerType, importerRecords, methods) => {
  methods = methods || {
    split: (value, args) => String(value).split(args.pattern)
  }

  const records = recordConstructor();
  const strategy = strategize(importerType);

  const applyField = (table, column) => {
    table.setField(column)
    const rel = strategy.mapping.forward[srcField]
  }

  const applicators = {
    relations() {
      Object.keys(strategy.relations).forEach(database => {
        Object.keys(strategy.relations[database]).forEach(table => {
          Object.entries(strategy.relations[database][table]).forEach((column, srcFields) => {
            applyField(
              records
                .setDatabase(database)
                .setTable(table),
              column
            )
            srcFields.forEach(srcField => {
              
              const refField = field
                .setReference(rel.table)
                .setField(rel.column)
              if (strategy.mapping.reverse[rel.database][rel.table][rel.column])
            })
              .setReference(strategy.mapping.forward[])
          
          }
        }
      }
    }
  }


  importerRecords.forEach((srcRecord) => {
    
    Object.keys(strategy.mapping.reverse).forEach(database => {
      
      Object.keys(strategy.mapping.reverse).forEach(table => {
        
        Object.entries(strategy[database][table]).forEach((column, srcFields) => {

          const field = records.setDatabase(database).setTable(table).setField(column)
          const srcFieldEntries = Object.entries(srcFields);

          // if this data is related to a different record, there might be more than one relations
          // to that table based on 
          if (strategy.relations[database][table][column]) {
            srcFieldEntries.forEach((srcKey, mapDef) => {
              // ensure existence for relations within this record
              records.setDatabase(database).setTable(table).setField(column).setRelation(srcRecord[srcKey])

              recordsPerFK[mapDef.target[0]][mapDef.target[1]] = srcRecord[srcKey]
            })
          }
          // when there is no constraint, we just map the values to their corresponding keys
          else {
            srcFieldEntries.forEach((srcKey) => {
              records.setDatabase(database).setTable(table).setField(column).setValue(srcRecord[srcKey])
            })            
          }
        })
      })
      
      // we now have, for each database, each table, multiple records

    })


  })
}