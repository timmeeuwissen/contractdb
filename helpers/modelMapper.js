import {forward as forwardSplit} from './modelMapper/methods/split'
import {forward as forwardConditionalRemap} from './modelMapper/methods/conditionalRemap'
import {forward as forwardboolRemap} from './modelMapper/methods/boolRemap'
import strategize from './strategize'
import dbTemplate from './dbTemplate'
import { deconstructTarget } from './dbSchema'

export const get_template = (mapDef, methods) => {
  methods = {
    ...(methods || {}), 
    split: forwardSplit,
    conditionalRemap: forwardConditionalRemap,
    boolRemap: forwardboolRemap
  }

  const skipKeys = {}
  const keyToField = {}
  const template = dbTemplate()
  const strategy = strategize(mapDef)

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