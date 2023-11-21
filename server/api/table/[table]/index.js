import queryableRelations from '~/helpers/queryableRelations'
import { getType } from '~/helpers/dbSchema'

export default defineEventHandler(async event => {
  const tableName = event.context.params.table.replaceAll(/[^a-z]/ig,'');

  // if (event.node.req.method && event.node.req.method == 'POST' && event._requestBody) {
  //   const [keys, values] = Object.entries(event._requestBody).reduce( 
  //     (prev, entry) => [[...prev[0], entry[0]], [...prev[1], entry[1]]],
  //     [[],[]]
  //   )

  //   return await connection().promise().query(
  //     `insert into ${tableName} (${keys.join(', ')}) ` +
  //     `values ('${Array(values.length).fill('?').join(', ')}')`, 
  //     values
  //   )
  // }

  if (event.node.req.method && event.node.req.method == 'GET' && !event.context.params.id) {
    const {
      records, 
      definitions, 
      foreignKeys, 
      tableConfiguration, 
      identifiedPerField,
      identifiedPerTable
    } = await queryableRelations(tableName)

    const headers = [
      ...(definitions
        .filter(def => !def.name.match(/^_/))
        .reduce((acc, def) => ([
          ...acc, { 
            title: def.name, // todo: i18n mapping
            key: def.name,
            align: getType(def.type).match(/INT|LONG|DECIMAL|FLOAT/) && !(def.name in foreignKeys.references) 
              ? 'end' 
              : 'begin',
            visualAid: (() => {
              if (def.name in foreignKeys.references) {
                return 'relation'
              }
            })()
          }
        ]), [])),
        { title: 'Actions', key: 'actions', align: 'end', sortable: false }
    ]

    return {
      headers, 
      records,
      tableConfiguration,
      foreignKeys,
      identifiedPerTable,
      identifiedPerField
    }  
  
  }
})
