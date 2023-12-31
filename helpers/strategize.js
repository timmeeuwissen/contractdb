import config from '~/config.json'
import { deconstructTarget } from './dbSchema'
// strategize groups actions in a certain way so that they can be traversed 
// more easily

const amendNoImport = (acc, srcKey, _target, _mapConf) => {
  acc.noImport[srcKey] = true
}

const amendDoImport = (acc, srcKey, _target, _mapConf) => {
  acc.doImport[srcKey] = true
}

const amendMapping = (acc, srcKey, target, mapConf) => {
  acc.mapping.forward[srcKey] = {...target, mapConf}
  
  if(!(target.database in acc.mapping.reverse)) {
    acc.mapping.reverse[target.database] = {}
  }

  if(!(target.table in acc.mapping.reverse[target.database])) {
    acc.mapping.reverse[target.database][target.table] = {}
  }

  if(!(target.column in acc.mapping.reverse[target.database][target.table])) {
    acc.mapping.reverse[target.database][target.table][target.column] = {}
  }

  acc.mapping.reverse[target.database][target.table][target.column][srcKey] = mapConf
}

const amendRelation = (acc, srcKey, target, mapConf) => {
  acc.relations.forward[srcKey] = {...target, mapConf}
  
  if(!(target.database in acc.relations.reverse)) {
    acc.relations.reverse[target.database] = {}
  }

  if(!(target.table in acc.relations.reverse[target.database])) {
    acc.relations.reverse[target.database][target.table] = {}
  }

  if(!(target.column in acc.relations.reverse[target.database][target.table])) {
    acc.relations.reverse[target.database][target.table][target.column] = []
  }
  else {
    const prevSrc = acc.relations.forward[
      acc.relations.reverse[target.database][target.table][target.column][0]
    ]
    if ((prevSrc.database !== target.database) || (prevSrc.table !== target.table)) {
      throw new Error(`Cannot relate two different tables and assign the outcome on one FK`)
    }
  }

  acc.relations.reverse[target.database][target.table][target.column].push(srcKey)
}

const amendMethod = (acc, srcKey, _target, mapConf) => {
  if (!(srcKey in acc.methods)) acc.methods[srcKey] = []
  acc.methods[srcKey].push(
    {
      method: mapConf.method,
      srcKey,
      mapConf
    }
  )
}

export default (mapDef) => {  
  const response = Object.entries(mapDef).reduce(
    (acc, [srcKey, mapDef]) => {
      // When there's no map definition, we skip the field
      if(!mapDef) {
        amendNoImport(acc, srcKey, null, null)
        return acc
      }

      // first see if we can find where the data should go
      if('target' in mapDef) {
        // figure out if we should place the field into a column on a table
        if(typeof mapDef.target == 'string') {
          amendMapping(acc, srcKey, deconstructTarget(mapDef.target))
        }
        // determine which fields imply a foreign key
        else if(Array.isArray(mapDef.target)) {
          mapDef.target.slice(0,-1).forEach((target, index) => {
            amendRelation(acc, srcKey, deconstructTarget(target), mapDef)
            amendMapping(acc, srcKey, deconstructTarget(mapDef.target[index+1]), mapDef)            
          })
        }
      }

      if('method' in mapDef) {
        amendMethod(acc, srcKey, null, mapDef)
      }

      amendDoImport(acc, srcKey, null, mapDef)
      return acc
    }, 
    {
      relations: {
        forward: {}, // key: sourceField, value: exact FK relation it belongs to
        reverse: {}, // keys: exact FK relation, value: sourcefields that are mapped to it
      },
      methods: [],
      mapping: {
        forward: {},
        reverse: {}
      },
      noImport: {},
      doImport: {}
    }
  )

  return {
    ...response, 
    fieldOrder: [
      ...Object.keys(response.doImport).filter(key => !(key in response.relations.forward)),
      ...Object.keys(response.relations.forward),
    ]
  }
}