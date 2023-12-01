import config from '~/config.json'
import connection from '~/helpers/connection'
import { getSchema, get_procedures, get_tables, get_views } from '~/helpers/dbSchema'
import { get_stringsForTables } from '~/helpers/identify'

const views = async database => {
  const [records] = await get_views(database)
  return records.reduce((acc, view) => {
    view['Name'] = view[`Tables_in_${database}`];
    delete view[`Tables_in_${database}`]
    return [...acc, view]
  }, [])
}

const tables = async database => {
  const [records] = await get_tables(database);
  const tables = records.reduce(
    (acc, entry) => ([...acc, Object.values(entry)[0]]), 
    []
  )

  const tableIdentifiedBy = await get_stringsForTables(
    database, 
    tables
  )

  return tables.reduce(
    (acc, tableName) => ([
      ...acc, 
      {
        tableName,
        inListing: (tableName in tableConfiguration)
          && ('omitFromListing' in tableConfiguration[tableName])
          ? !tableConfiguration[tableName].omitFromListing
          : true,
        icon: (tableName in tableConfiguration)
          ? tableConfiguration[tableName].icon
          : undefined,
        title: (
          (tableName in tableConfiguration)
          && ('title' in tableConfiguration[tableName])
        )
          ? tableConfiguration[tableName].title
          : tableName, 
        identifiedBy: tableIdentifiedBy[tableName]
      }
    ])
    ,[]
  )
}

const { connection: {database}, tableConfiguration } = config
export default defineEventHandler(async event => {
  return {
    tables: await tables(config.connection.database),
    views: await views(config.connection.database),
    procedures: (await get_procedures(config.connection.database))[0],
    schema: await getSchema(),
  }
})
