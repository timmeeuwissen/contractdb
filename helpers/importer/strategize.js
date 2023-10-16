import config from '~/config.json'

const deconstructTarget = (targetString) => {
  // make sure we know the database, table and column
  let location = mapDef.target.split('.')

  while(location.length < 3) {
    location = [null, ...location];
  }

  const [database, table, column] = location;
  if (!database) database = config.connection.database
  return {database, table, column}
}

const amendNoImport = (acc, srcKey, _target, _mapConf) => {
  acc.noImport.push(srcKey)
}

const amendMapping = (acc, srcKey, target, mapConf) => {
  acc.mapping.forward[srcKey] = target
  
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

const amendRelation = (acc, srcKey, target, _mapConf) => {
  acc.relations.forward[srcKey] = target

  if(!(target.database in acc.relations.reverse)) {
    acc.relations.reverse[target.database] = {}
  }

  if(!(target.table in acc.relations.reverse[target.database])) {
    acc.relations.reverse[target.database][target.table] = {}
  }

  if(!(target.column in acc.relations.reverse[target.database][target.table])) {
    acc.relations.reverse[target.database][target.table][target.column] = []
  }

  acc.relations.reverse[target.database][target.table][target.column].push(srcKey)
}

const amendMethod = (acc, srcKey, _target, mapConf) => {
  acc.methods.push(
    {
      method: mapConf.method,
      srcKey,
      mapConf
    }
  )
}

export default (importerType) => {
  if (!(importerType in config.imports)) throw new Error('ImporterType nonexistent')
  if (!('mapping' in config.imports[importerType])) throw new Error('ImporterType missing mapping?')
  
  const mapping = config.imports[importerType].mapping;

  return Object.entities(mapping).reduce(
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
          amendMapping(acc, srcKey, deconstructTarget(mapDef.target, mapDef))
        }
        // determine which fields imply a foreign key
        else if(Array.isArray(mapDef.target) && mapDef.target.length == 2) {
          amendRelation(acc, srcKey, deconstructTarget(mapDef.target[0]), mapDef)
          amendMapping(acc, srcKey, deconstructTarget(mapDef.target[1]), mapDef)
        }
        else throw new Error('targets are either strings or a tuple of 2 to indicate the relational field')
      }

      if('method' in mapDef) {
        amendMethod(acc, srcKey, null, mapDef)
      }
    }, 
    {
      relations: {
        forward: {},
        reverse: {}
      },
      methods: [],
      mapping: {
        forward: {},
        reverse: {}
      },
      noImport: []
    }
  )
}