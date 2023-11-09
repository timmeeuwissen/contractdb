import connection from '~/helpers/connection'
import config from '~/config.json'
import { getAllPrimaryKeys, getConstraintsForTable } from '~/helpers/dbSchema'
import { get_stringsForTables, extractValues, apply_recToIndentiedBy } from '~/helpers/identify';
import { getType } from '~/helpers/dbSchema';

// you provide the table you are at right now, 
// and it returns the data of all the autocompleters on your page
export default defineEventHandler(async event => {
  const tableName = event.context.params.table.replaceAll(/[^a-z]/ig,'');
  const foreignKeys = await getConstraintsForTable(tableName)

  const relatedTables = Object.keys(Object.values(foreignKeys.references).reduce(
    (acc, ref) => ({...acc, [ref.table]: true}), 
    {}
  ))

  const primaryKeys = await getAllPrimaryKeys()

  const tableIdentifiedBy = await get_stringsForTables(
    config.connection.database, 
    relatedTables
  )

  const result = relatedTables.reduce(
    async (acc, relatedTable) => {
      const [records] = await connection().promise().query(
        `select ${primaryKeys[config.connection.database][relatedTable]} as _PK, ${extractValues(tableIdentifiedBy[relatedTable]).join(', ')} ` +
        `from ${relatedTable}`
      )
          
      return {
        ...(await acc), 
        [relatedTable]: records.reduce((tableAcc, rec) => ([
            ...tableAcc,
            {
              value: rec._PK,
              title: apply_recToIndentiedBy(tableIdentifiedBy[relatedTable], rec)
            }
          ]), [])
      }
    }, 
    {}
  )

  return result
})
