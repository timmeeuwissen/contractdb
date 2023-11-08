import connection from '~/helpers/connection'
import config from '~/config.json'
import { getAllPrimaryKeys, getConstraintsForTable } from '~/helpers/dbSchema'
import { getType } from '~/helpers/dbSchema'

export default defineEventHandler(async event => {
  const tableName = event.context.params.table.replaceAll(/[^a-z]/ig,'');

  if (event.node.req.method && event.node.req.method == 'GET' && event.context.params.id) {
    const primaryKeys = await getAllPrimaryKeys()
    const primaryKey = primaryKeys[config.connection.database][tableName]

    const [records, defRec] = await connection().promise().query(
      `select * from ${tableName} where ${primaryKey} = ?`, 
      [event.context.params.id]
    );
    
    if(records.length != 1) {
      error({ statusCode: 404, message: 'Record not found' })
    }

    const foreignKeys = await getConstraintsForTable(tableName)

    const definitions = defRec.reduce(
      (acc, def) => ({
        ...acc, 
        [def.name]: {
          ...(
            (tableName in config.tableConfiguration)
            && ('fields' in config.tableConfiguration[tableName])
            && (def.name in config.tableConfiguration[tableName].fields)
            ? config.tableConfiguration[tableName].fields[def.name]
            : {}
          ),
          type: getType(def.type),
          title: def.name,
          mutable: def.name != primaryKey,
          constraint: def.name in foreignKeys.references 
            ? foreignKeys.references[def.name]
            : undefined
        }
      }), 
      {}
    )

    return { record: records[0], definitions, primaryKey, foreignKeys }
  }
})
