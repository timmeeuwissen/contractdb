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
        `on ${ref[1].table}_${idx}.${ref[1].column} = qble.${ref[0]}`
      )

      return acc
    },
    {select: [], join: [], identifiedPerField: {}, group: []}
  )

  const primaryKeys = await getAllPrimaryKeys()

  const {identifiedPerTable, ...referencedBys} = foreignKeys.referencedBy.reduce(
    (acc, ref, idx) => {      
      // add the count
      acc.select.push(
        ` count(${ref.table}_${idx}_ref.${primaryKeys[config.connection.database][ref.table]}) as _${ref.table}_ref_count `
      )

      // when there are constraints that prevent deletion, we want to know beforehand
      if(ref.deleteRule == 'RESTRICT')
        acc.sumForDisableDelete.push(
          `count(${ref.table}_${idx}_ref.${primaryKeys[config.connection.database][ref.table]})`
        )
      
      // join the table
      acc.join.push(
        `left join ${ref.table} as ${ref.table}_${idx}_ref ` +
        `on ${ref.table}_${idx}_ref.${ref.column} = qble.${ref.targetCol} `
      )
      
      acc.identifiedPerTable[`_${ref.table}_ref_count`] = {
        identifier:
          config.tableConfiguration
          && config.tableConfiguration[ref.table]
          && config.tableConfiguration[ref.table].title
          ? config.tableConfiguration[ref.table].title
          : ref.table,
        constraint: ref
      }

      return acc
    },
    {select: [], join: [], sumForDisableDelete: [], identifiedPerTable: {}, group: []}
  )
  if (referencedBys.join.length) referencedBys.group.push(
    ` qble.${primaryKeys[config.connection.database][queryableName]} `
  )

  const queryParts = {
    select: [
      `qble.*`, 
      ...(primaryKeys[config.connection.database][queryableName]
        ? [`qble.${primaryKeys[config.connection.database][queryableName]} as _PK`]
        : []),
      ...(referencedBys.sumForDisableDelete.length
        ? [`${referencedBys.sumForDisableDelete.join(' + ')} as _disableDelete`]
        : []),
      ...references.select,
      ...referencedBys.select
    ].join(', '),
    from: queryableName,
    join: [...references['join'], ...referencedBys['join']].join(' '),
    group: [...references.group, ...referencedBys.group].join(', ')
  }
  
  const query = `select ${queryParts.select} ` +
    `from ${queryParts.from} as qble ` +
    `${queryParts['join']} ` +
    `${queryParts.group ? ' group by ' + queryParts.group : ''} `

  const [records, definitions] = await connection().promise().query(query)


  return {
    records, 
    definitions, 
    foreignKeys, 
    primaryKeys, 
    identifiedPerTable,
    tableConfiguration: config.tableConfiguration[queryableName], 
    identifiedPerField
  }
}