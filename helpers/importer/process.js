import connection from '../connection'
import { getAllPrimaryKeys, getFlags } from '../dbSchema'
import { get_template } from '../modelMapper'

export const execute = async (mapDef, importerRecords, methods) => {
  const primaryKeys = await getAllPrimaryKeys()
  const { template, keyToField } = get_template(mapDef, methods)

  const logStatModel = {
    insert: 0,
    update: 0,
    processed: 0,
    errors: []
  }

  const databaseStats = {
    totals: structuredClone(logStatModel),
    perTable: {}
  }

  const logStats = (database, table, result, error) => {
    if (!(database in databaseStats.perTable)) {
      databaseStats.perTable[database] = {}
    }
    if (!(table in databaseStats.perTable[database])){
      databaseStats.perTable[database][table] = structuredClone(logStatModel)
    }

    if (error) {
      databaseStats.totals.errors.push(error)
      databaseStats.perTable[database][table].errors.push(error)
      console.log(database, table, result, error)
      if(result) console.log(getFlags(result.serverStatus), getFlags(result.warningStatus))
      return
    }

    if (result[0].affectedRows) {
      databaseStats.totals.update++
      databaseStats.perTable[database][table].update++
    }

    databaseStats.totals.processed++
    databaseStats.perTable[database][table].processed++
    // console.log(database, table, result, getFlags(result.serverStatus), getFlags(result.warningStatus))

    return
  }

  const recordCb = async (meta, record) => {
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

  console.log('starting import')
  connection().beginTransaction()

  const allRecords = []

  // iterate over the flat record to apply it to the database
  importerRecords.forEach(srcRecord => {
    
    // each relevant sourcefield is mapped to a target field which is 
    // a reference to the layered structure within the dbTemplate
    Object.entries(keyToField).forEach(([srcKey, fieldTarget]) => {
      fieldTarget.applyValue(srcRecord[srcKey])
    })

    // traverse the entire model, including foreign key constraints, and 
    // use the callback to resolve what to do with the records.
    allRecords.push(template.applyRecords(recordCb))
  })

  try {
    await Promise.all(allRecords)
    console.log('committing input')
    connection().commit()
  }
  catch(err) {
    console.log('rolling back', err.message)
    connection().rollback()
    throw err
  }

  console.log('import finished', databaseStats)
  return databaseStats
}