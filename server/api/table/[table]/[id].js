import connection from '~/helpers/connection'
import config from '~/config.json'
import { getAllPrimaryKeys, getConstraintsForTable } from '~/helpers/dbSchema'
import { getType } from '~/helpers/dbSchema'
import { get_stringsForTables, get_relatingRecordsIdentified } from '~/helpers/identify'

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
      {
        _PK: primaryKey,
        _identifiedBy: (
          await get_stringsForTables(config.connection.database, [tableName])
        )[tableName],
        _tableTitle: ((tableName in config.tableConfiguration) ? config.tableConfiguration[tableName].title : undefined) || tableName,
        _tableIcon: (tableName in config.tableConfiguration) ? config.tableConfiguration[tableName].icon : undefined
      }
    )
    
    const relatingRecords = (await get_relatingRecordsIdentified(
      config.connection.database, 
      tableName,
      parseInt(event.context.params.id)
    )).reduce((acc, rec) => ([...acc, {
      ...rec,
      _tableTitle: ((rec.Type in config.tableConfiguration) ? config.tableConfiguration[rec.Type].title : undefined) || rec.Type,
      _tableIcon: (rec.Type in config.tableConfiguration) ? config.tableConfiguration[rec.Type].icon : undefined
    }]),[])

    return { 
      record: records[0], 
      definitions, 
      foreignKeys, 
      primaryKey,
      relatingRecords,
    }
  }
})
