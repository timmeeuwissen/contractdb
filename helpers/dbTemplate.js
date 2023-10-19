export default () => {
  
  const _field = (meta, priorExposures) => {
    let currentReference, currentMethods = [], applied

    const expose = {
      ...priorExposures,
      setReference(refMeta) {
        currentReference = _tables(refMeta).setTable(refMeta.table)
        return currentReference
      },
      setMethod(method, args) {
        currentMethods.push({method, args})
        return expose
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
          console.log('we seem to have a reference')
          const intermediary = await currentReference.applyRecords(recordCb)
          console.log ('intermediary value is', intermediary)
          expose.applyValue(intermediary)
          console.log('and its applied value is ', applied)
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
        Object.values(tables).forEach(table => table.applyRecords(recordCb))
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
        Object.values(databases).forEach(tables => {
          tables.applyRecords(recordCb)
        })
        return expose
      },
    }
    return expose
  }

  return _databases()
} 