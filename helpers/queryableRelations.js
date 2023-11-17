import config from '~/config.json'
import connection from '~/helpers/connection'
import { getAllPrimaryKeys, getConstraintsForTable } from './dbSchema'
import { get_stringsForTables, extractValues } from './identify';
import { getType } from './dbSchema';


export default async (queryableName) => {
  const foreignKeys = await getConstraintsForTable(queryableName)

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
        `on ${ref[1].table}_${idx}.${ref[1].column} = ${queryableName}.${ref[0]}`
      )

      return acc
    },
    {select: [], join: [], identifiedPerField: {}}
  )

  const primaryKeys = await getAllPrimaryKeys()

  const queryParts = {
    select: [
      `${queryableName}.*`, 
      ...(primaryKeys[config.connection.database][queryableName]
        ? [`${queryableName}.${primaryKeys[config.connection.database][queryableName]} as _PK`]
        : []),
      ...references.select
    ].join(', '),
    from: queryableName,
    join: references['join'].join(' ')
  }
  
  const query = `select ${queryParts.select} from ${queryParts.from} ${queryParts['join']}`

  const [records, definitions] = await connection().promise().query(query)


  return {
    records, 
    definitions, 
    foreignKeys, 
    primaryKeys, 
    tableConfiguration: config.tableConfiguration[queryableName], 
    identifiedPerField
  }
}