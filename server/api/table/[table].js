import connection from '~/connection'
import config from '~/config.json'

const extractValues = str => [[...str.matchAll(/{{\s?(.+?)\s}}/ig)].map(rec => rec[1])]

const getForeignKeys = async table => {
  const [foreignKeyRecords] = await connection().promise().query(
    'select TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME ' +
    'from information_schema.key_column_usage ' +
    'where REFERENCED_TABLE_SCHEMA is not null ' +
    `and (TABLE_NAME = '${table}' or REFERENCED_TABLE_NAME = '${table}')`);

  return foreignKeyRecords.reduce((acc,rec) => {
    if (rec.TABLE_NAME == table) {
      acc.references[rec.COLUMN_NAME] = {
        table: rec.REFERENCED_TABLE_NAME, 
        column: rec.REFERENCED_COLUMN_NAME
      }
    }
    if (rec.REFERENCED_TABLE_NAME == table) {
      acc.referencedBy.push({
        table: rec.TABLE_NAME, 
        column: rec.COLUMN_NAME
      })
    }

    return acc;
  }, {references: {}, referencedBy: []})
}

export default defineEventHandler(async event => {
  const tableName = event.context.params.table.replaceAll(/[^a-z]/ig,'');

  if (event.node.req.method && event.node.req.method == 'POST' && event._requestBody) {
    const [keys, values] = Object.entries(event._requestBody).reduce( 
      (prev, entry) => [[...prev[0], entry[0]], [...prev[1], entry[1]]],
      [[],[]]
    )

    return await connection().promise().query(
      `insert into ${tableName} (${keys.join(', ')}) values ('${Array(values.length).fill('?').join(', ')}')`, 
      values
    )
  }

  if (event.node.req.method && event.node.req.method == 'GET' && event.context.params.id) {
    const [tableDefRec] = await connection().promise().query(
      `show full columns from ${tableName} where \`Key\`='PRI'`
    )
    const [records, definitions] = await connection().promise().query(
      `select * from ${tableName} where ${tableDefRec.records[0].Field} = ?`, 
      [event.query.id]
    );
    return {records, definitions}
  }

  if (event.node.req.method && event.node.req.method == 'GET' && !event.context.params.id) {
    const foreignKeys = await getForeignKeys(tableName)
    console.log(foreignKeys);
    const joinClauses = Object.entries(foreignKeys.references).reduce(
      (acc, ref, idx) => {
        // add a field which indicates that the left join actually yielded a record
        acc.select.push(`if(${ref[1].table}_${idx}.${ref[1].column} is not null, 1, 0) as _${ref[0]}_exists`)

        // add the fields that are used in the identifiedBy config field to the query response
        if (config.tableConfiguration[ref[1].table].identifiedBy) {
          extractValues(config.tableConfiguration[ref[1].table].identifiedBy).forEach(field => {
            acc.select.push(`${ref[1].table}_${idx}.${field} as _${ref[0]}_iBy_${field}`)
          });
        } 

        // join the table
        acc.join.push(
          `left join ${ref[1].table} as ${ref[1].table}_${idx} ` +
          `on ${ref[1].table}_${idx}.${ref[1].column} = ${tableName}.${ref[0]}`
        )

        return acc
      },
      {select: [], join: []}
    )

    const queryParts = {
      select: [`${tableName}.*`, ...joinClauses.select].join(', '),
      from: tableName,
      join: joinClauses['join'].join(' ')
    }

    const [records, definitions] = await connection().promise().query(
      `select ${queryParts.select} from ${queryParts.from} ${queryParts['join']}`
    )
    
    return {records, definitions, foreignKeys}
  }
})
