export default () => {
  
  const _field = (loc) => {
    let currentValue, currentReference, currentMethods
    const __field = () => ({
      setValue(value) {
        currentValue = value
        return _colum
      },
      setReference(table) {
        currentReference = _table()
        currentReference.setTable(table)
      },
      setMethod(method) {
        currentMethods.push
      }
    })
    return __field()
  }

  const _columns = (loc) => {
    return {
      setField(field) {
        const single = _field({...loc, field})
        // fields.push(single)
        return single
      },
    }
  }

  const _table = (loc) => ({
    setTable(table) {
      return _columns({...loc ,table})
    }
  })

  const _db = () => ({
    setDatabase(database) { 
      return _table({database})
    },
  })

  return _db()
} 