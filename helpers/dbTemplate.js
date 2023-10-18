export default () => {
  
  const _field = (meta, priorExposures) => {
    let currentReference, currentMethods = [], applied

    const expose = {
      ...priorExposures,
      setReference(table) {
        if (currentValue) throw new Error('cannot set reference if value is already set')
        currentReference = _tables()
        currentReference
          .setTable(table)
          .newRecord()
        return currentReference
      },
      setMethod(method, args) {
        currentMethods.push({method, args})
        return expose
      },
      applyValue(value) {
        // flatten the potential values produced by the callbacks
        applied = currentMethods.reduce(
          (value, {method, args}) => 
          value.map(method(value, args))
            .reduce(
              (acc, value) => 
              [...acc, ...(Array.isArray(value) ? value : [value]) ],
              []
            )
          , [value])
      },
      applyRecords(recordCb) {
        if(currentReference) {
          applyValue(currentReference.applyRecords(recordCb))
        }
        return {[meta.field]: applied}
      },
      reset() {
        applied = undefined
      }
    }
    return expose
  }

  const _records = (meta, priorExposures) => {
    const fields = {}
    const expose = {
      ...priorExposures,
      // newRecord() {
      //   records.push([])
      //   return _records(meta, expose)
      // },
      setField(field) {
        fields[field] = _field({...meta, field}, expose)
        return fields[field]
      },
      applyRecords(recordCb) {
        // obtain the KV pairs
        const appliedFields = fields.reduce(
          (acc, field) => {
            const appliedField = field.applyRecords(recordCb)
            if (appliedField) {
              Object.entries(appliedField).forEach(([key, value]) => {
                if(key in acc) {
                  throw new Error(`Key:${key} was already defined in ${acc}`)
                }
                // this is where the model currently breaks, since the callback can return an array
                // todo: deal with array or object or array of objects feedback from the callbacks
                // for now, we assume the callbacks won't return objects or arrays
                acc[key] = value[0]
              })
            }

            // reset the field to its initial state
            field.reset()

            return acc
          }, {})

        if (Object.keys(appliedFields).length) {
          recordCb(meta, appliedFields)
        } 
      },
      traverse: (cb) => records.forEach(record => cb('record', record, fields.forEach(field => field.traverse(cb))))
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
      applyRecords(recordCb) {
        Object.values(tables).forEach(table => table.applyRecords(recordCb))
      },
      traverse: (cb) => Object.entries(tables).forEach((table, records) => cb('table', table, records.traverse(cb)))
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
      applyRecords(recordCb) {
        Object.values(databases).forEach(tables => {
          tables.applyRecords(recordCb)
        })
      },
    }
    return expose
  }

  return _databases()
} 