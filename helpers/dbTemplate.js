export default () => {
  
  const _field = (meta, priorExposures) => {
    let currentReference, currentReferenceSet, currentMethods = [], applied, currentProperties

    const expose = {
      ...priorExposures,
      setReference(refMeta) {
        if(currentReference) return currentReference
        currentReferenceSet = _databases()
        currentReference = currentReferenceSet.setDatabase(refMeta.database).setTable(refMeta.table)
        return currentReference
      },
      setMethod(method, args) {
        currentMethods.push({method, args})
        return expose
      },
      setProperties(properties, merge = true) {
        currentProperties = merge 
          ? {...(currentProperties || {}), ...properties}
          : properties
      },
      setProperty(key, value) {
        currentProperties[key] = value
      },
      applyValue(value) {
        // flatten the potential values produced by the callbacks
        applied = currentMethods.reduce(
          (acc, {method, args}) => 
          acc.map((value) => method(value, args))
            .reduce(
              (acc, value) => 
              [...acc, ...(Array.isArray(value) ? value : [value]) ],
              []
            )
          , [value])
      },
      async applyRecords(recordCb) {
        if(currentReference) {
          const intermediary = await currentReference.applyRecords(recordCb)
          expose.applyValue(intermediary)
        }
        return {[meta.field]: applied}
      },
      reset() {
        applied = undefined
      },
      getTree() {
        const tree = {meta, properties: currentProperties, methods: currentMethods}
        return currentReferenceSet
          ? {...tree, children: currentReferenceSet.getTree()}
          : tree
      },
      toString() {
        return `${meta.database}.${meta.table}.${meta.field}`
      },
      find(metaSearch) {
        if(currentReference && metaSearch._refSearch) return currentReference
        if(!currentReference && metaSearch._createIfNotSet) {
          currentReferenceSet = _databases()
          currentReference = currentReferenceSet.find(metaSearch)
          return currentReference
        }
      },
      getProperties() {
        return currentProperties
      },
      getMeta() {
        return meta
      }
    }
    return expose
  }

  const _records = (meta, priorExposures) => {
    const fields = {}
    const expose = {
      ...priorExposures,
      setField(field) {
        fields[field] = _field({...meta, field}, expose)
        return fields[field]
      },
      async applyRecords(recordCb) {
        // obtain the KV pairs
        const appliedFields = await Object.values(fields).reduce(
          async (acc, field) => {
            const appliedField = await field.applyRecords(recordCb)
            acc = (await acc)
            if (appliedField) {
              Object.entries(appliedField).forEach(async ([key, value]) => {
                if(key in acc) {
                  throw new Error(`Key:${key} was already defined in ${acc}`)
                }
                if(value && value.length && (value[0]!==undefined)) {
                  // this is where the model currently breaks, since the callback can return an array
                  // todo: deal with array or object or array of objects feedback from the callbacks
                  // for now, we assume the callbacks won't return objects or arrays
                  acc[key] = value[0]
                }
              })
            }
            // reset the field to its initial state
            field.reset()

            return acc
          }, {})

        if (Object.keys(appliedFields).length) {
          return await recordCb(meta, appliedFields)
        } 
      },
      getTree(){
        return Object.entries(fields).reduce((acc, [key, fieldDetails]) => ([
            ...acc,
            {
              type: 'field',
              title: key,
              meta,
              path: expose.toString(),
              ...fieldDetails.getTree(),
            }
          ]), [])        
      },
      toString() {
        return `${meta.database}.${meta.table}`
      },
      find(metaSearch) {
        if('column' in metaSearch) {
          if(metaSearch.column in fields) {
            return (fields[metaSearch.column]).find(metaSearch) || fields[metaSearch.column]
          }
          if(metaSearch._createIfNotSet) {
            return expose.setField(metaSearch.column)
          }
          throw new Error(`Field ${metaSearch.column} was not yet defined in the template for table ${metaSearch.table} and database ${metaSearch.database}`)
        }
        return expose
      }      
    }
    return expose
  }

  const _tables = (meta, priorExposures) => {
    const tables = {}
    const expose = {
      ...priorExposures,
      setTable(table) {
        if (!(table in tables)) tables[table] = _records({...meta ,table}, expose)
        return tables[table]
      },
      async applyRecords(recordCb) {
        return Object.values(tables).map(table => table.applyRecords(recordCb))
      },
      getTree(){
        return Object.entries(tables).reduce((acc, [table, records]) => ([
            ...acc,
            {
              type: 'table',
              title: table,
              meta,
              path: expose.toString(),
              children: records.getTree()
            }
          ]), [])        
      },
      toString() {
        return `${meta.database}`
      },
      find(metaSearch) {
        if('table' in metaSearch) {
          if(metaSearch.table in tables) {
            return (tables[metaSearch.table]).find(metaSearch) || expose
          }
          if(metaSearch._createIfNotSet) {
            return expose.setTable(metaSearch.table).find(metaSearch)
          }
          throw new Error(`Table ${metaSearch.table} was not yet defined in the template for database ${metaSearch.database}`)
        }
        return expose
      }
    }
    return expose
  }

  const _databases = () => {
    const databases = {}
    const expose = {
      setDatabase(database) { 
        if(!(database in databases))
          databases[database] = _tables({database}, expose)
        return databases[database]
      },
      async applyRecords(recordCb) {
        return Object.values(databases).map(async tables => await tables.applyRecords(recordCb))
      },
      getTree(){
        return Object.entries(databases).reduce((acc, [database, tables]) => ([
            ...acc,
            {
              type: 'database',
              title: database,
              meta: {},
              path: '',
              children: tables.getTree()
            }
          ]), [])        
      },
      toString() {
        return ''
      },
      find(metaSearch) {
        if('database' in metaSearch) {
          if(metaSearch.database in databases) {
            return (databases[metaSearch.database]).find(metaSearch) || expose
          }
          if(metaSearch._createIfNotSet) {
            return expose.setDatabase(metaSearch.database).find(metaSearch)
          }
          throw new Error(`Database ${metaSearch.database} was not yet defined in the template`)
        }
        throw new Error(`Database not defined in ${metaSearch}`)
      }
    }
    return expose
  }
  
  return _databases()
} 