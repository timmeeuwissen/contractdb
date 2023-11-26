import connection from '~/helpers/connection'
import config from '~/config.json'
import { getAllPrimaryKeys, getConstraintsForTable, getUniques } from '~/helpers/dbSchema'
import { getType } from '~/helpers/dbSchema'
import { get_stringsForTables, get_relatingRecordsIdentified } from '~/helpers/identify'
import { decode_columns } from '~/helpers/dbCommentConfig'

export default defineEventHandler(async event => {
  const 
    tableName = event.context.params.table.replaceAll(/[^a-z]/ig,''),
    id = parseInt(event.context.params.id),

    primaryKeys = await getAllPrimaryKeys(),
    primaryKey = primaryKeys[config.connection.database][tableName]

  const [records, defRec] = await connection().promise().query(
    `select * from ${tableName} where ${primaryKey} = ?`, 
    [event.context.params.id]
  );
  
  if(records.length != 1) {
    error({ statusCode: 404, message: 'Record not found' })
  }
  if (event.node.req.method && event.node.req.method == 'PUT') {
    const reqBody = await readBody(event)
    
    const {changed, updateClause} = Object.keys(reqBody).reduce(
      (acc, key) => {
        const changes = []
        if (!(key in records[0])) {
          changes.push('nonexistent')
        }
        else if (records[0][key] != reqBody[key]) {
          changes.push('changed')
          
          acc.updateClause.keys.push(`${key} = ?`)
          acc.updateClause.values.push(reqBody[key])
        }
        
        if (changes.length) acc.changed[key] = changes
        return acc
      },
      {changed: {}, updateClause: {keys: [], values: []}}
    )
    
    let violations = {},
        updated = {},
        error = {}
    if(updateClause.keys.length){
      await connection().promise().beginTransaction()
      try {
        const [updProps] = await connection().promise().query(
          `update ${tableName} set ${updateClause.keys.join(', ')} where ${primaryKey} = ?`, 
          [...updateClause.values, event.context.params.id  ]
        );
        updated = updProps
      }
      catch(e) {
        console.log(e)
        if (e.code == 'ER_DUP_ENTRY') {
          const violatedConstraint = e.sqlMessage.match(/'([^']*?)'$/)[1].split('.')
          const uniques = await getUniques(
            config.connection.database, 
            violatedConstraint[0]
          )
          violations = uniques[violatedConstraint[1]].reduce((acc, k) => ({...acc, [k]: violatedConstraint[1]}), {})
        }
        else {
          // console.error(e)
          error = e
        }
      }
      
      await connection().promise().rollback()
    }
    console.log({changed, violations, error, updated})
    return {changed, violations, error, updated}

  }
  else if (event.node.req.method && event.node.req.method == 'GET') {

    const foreignKeys = await getConstraintsForTable(tableName)
    const decodedColumns = await decode_columns(config.connection.database, tableName)

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
      decodedColumns,
    }
  }
})
