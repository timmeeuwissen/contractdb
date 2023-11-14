import connection from '~/helpers/connection'
import config from '~/config.json'
import { getAllPrimaryKeys, getConstraintsForTable } from '~/helpers/dbSchema'
import { get_stringsForTables, extractValues } from '~/helpers/identify';
import { getType } from '~/helpers/dbSchema';

export default defineEventHandler(async event => {
  const tableName = event.context.params.table.replaceAll(/[^a-z]/ig,'');

  if (event.node.req.method && event.node.req.method == 'POST' && event._requestBody) {
    const [keys, values] = Object.entries(event._requestBody).reduce( 
      (prev, entry) => [[...prev[0], entry[0]], [...prev[1], entry[1]]],
      [[],[]]
    )

    return await connection().promise().query(
      `insert into ${tableName} (${keys.join(', ')}) ` +
      `values ('${Array(values.length).fill('?').join(', ')}')`, 
      values
    )
  }

  if (event.node.req.method && event.node.req.method == 'GET' && !event.context.params.id) {
    const foreignKeys = await getConstraintsForTable(tableName)

    const tableIdentifiedBy = await get_stringsForTables(
      config.connection.database, 
      ( 
        Object.values(foreignKeys.references).reduce(
          (acc, ref) => ([...acc, ref.table]), 
          []
        )
      )
    )
    
    const {identifiedPerField, ...references} = Object.entries(foreignKeys.references).reduce(
      (acc, ref, idx) => {
        // add a field which indicates that the left join actually yielded a record
        acc.select.push(`if(${ref[1].table}_${idx}.${ref[1].column} is not null, 1, 0) as _${ref[0]}_exists`)
        
        acc.identifiedPerField[ref[0]] = tableIdentifiedBy[ref[1].table]

        // add the fields that are used in the identifiedBy config field to the query response
        extractValues(tableIdentifiedBy[ref[1].table]).forEach(field => {
          acc.select.push(`${ref[1].table}_${idx}.${field} as _${ref[0]}_iBy_${field}`)
        });

        // join the table
        acc.join.push(
          `left join ${ref[1].table} as ${ref[1].table}_${idx} ` +
          `on ${ref[1].table}_${idx}.${ref[1].column} = ${tableName}.${ref[0]}`
        )

        return acc
      },
      {select: [], join: [], identifiedPerField: {}}
    )

    const primaryKeys = await getAllPrimaryKeys()

    const queryParts = {
      select: [
        `${tableName}.*`, 
        `${tableName}.${primaryKeys[config.connection.database][tableName]} as _PK`,
        ...references.select
      ].join(', '),
      from: tableName,
      join: references['join'].join(' ')
    }

    const [records, definitions] = await connection().promise().query(
      `select ${queryParts.select} from ${queryParts.from} ${queryParts['join']}`
    )

    const requestURL = getRequestURL(event)

    if (requestURL.searchParams.get('format') == 'ui') {
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
        tableConfiguration: config.tableConfiguration[tableName],
        foreignKeys,
        identifiedPerField
      }
    }
    else {
      return {records, definitions, foreignKeys, primaryKeys, tableConfiguration: config[tableName], identifiedPerField}
    }
  }
})
