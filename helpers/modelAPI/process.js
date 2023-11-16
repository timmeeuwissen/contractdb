import connection from '../connection'
import { getAllPrimaryKeys } from '../dbSchema'
import { get_template } from '../modelMapper'

export const execute = async (mapDef, methods) => {
  const primaryKeys = await getAllPrimaryKeys()
  const { template, keyToField } = get_template(mapDef, methods)

  const queryCB = async (meta, record) => {
    const keys = Object.keys(record), values = Object.values(record)
    const priKey = primaryKeys[meta.database][meta.table]

    if (!priKey) {
      throw new Error('Could not determine primary key for', meta)
    }

    const updateInsertId = priKey in record 
      ? ''
      : `${priKey} = LAST_INSERT_ID(${priKey}), `

    const query = `insert into ${meta.database}.${meta.table} (${keys.join(',')}) `+
      `values(${Array(keys.length).fill('?').join(',')}) ` +
      `on duplicate key update ` +
      updateInsertId +
      keys.reduce((acc, key) => ([...acc, `${key} = values(${key})`]), []).join(', ')
    
    try {
      const result = await connection().promise().query(query, values)
      logStats(meta.database, meta.table, result)
      const insertId = result[0].insertId || record[priKey]
      return insertId
    }
    catch(err) {
      logStats(meta.database, meta.table, null, err)
      return null
    }
  }


  return databaseStats
}