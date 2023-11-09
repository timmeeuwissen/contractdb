import config from '~/config.json'
import connection from '~/helpers/connection'
import { get_stringsForTables } from '~/helpers/identify'

const { connection: {database}, tableConfiguration } = config
export default defineEventHandler(async event => {
  const [records] = await connection().promise().query('show tables');
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
            identifiedBy: tableIdentifiedBy[tableName]
          }
        ])
    ,[]
  )
})
