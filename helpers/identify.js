import config from '~/config.json'
import connection from '~/helpers/connection'
import { getAllConstraints, getAllPrimaryKeys, getUniques } from './dbSchema'

const resolvedIdentifications = {}

export const extractValues = str => [...str.matchAll(/{{\s?(.+?)\s}}/ig)].map(rec => rec[1])

export const get_stringsForTables = async (database, tables) => await tables.reduce(
  async (accProm, table) => {
    const acc = await accProm
    if (
      config.connection.database == database 
      && (table in config.tableConfiguration)
      && ('identifiedBy' in config.tableConfiguration[table])) {
      acc[table] = config.tableConfiguration[table].identifiedBy
    }
    // find the biggest unique on the table, since it says the most about the record
    // ordering of fields is done in the database
    else {
      acc[table] = Object.entries(await getUniques(database, table)).sort((a,b) => 
        (a[0] == 'PRIMARY') 
          ? 1 
          : (a[1].length > b[1].length || b[0] == 'PRIMARY' ? -1 : 0)
      )[0][1].map(unique => '{{ ' + unique + ' }}').join(', ')
    }

    return acc
  },
  {}
)

export const apply_recToIndentifyBy = (identifiedBy, rec) => 
  identifiedBy.replaceAll(
      /\{\{\s?(.*?)\s\}\}/g, 
      (_match, field) => rec[field]
    ) 

// todo: if the identifier contains a constraint, travel deeper.
export const get_relatingRecordsIdentified = async (database, table, pk) => {
  const primaryKeys = await getAllPrimaryKeys()
  const constraints = await getAllConstraints()

  if (!(table in constraints)) return []
  const referencedBy = constraints[table].referencedBy;

  const identifiers = await get_stringsForTables(
    database, 
    referencedBy.reduce((acc, ref) => ([...acc,ref.table]),[])
  )

  const extracted = Object.entries(identifiers).reduce(
    (acc, [k,v]) => ({...acc, [k]: extractValues(v)}), 
    {}
  )

  const get_clause = (pTable, pCol) => 
    `select ` +
    `  ${pTable}.${primaryKeys[config.connection.database][pTable]} as '_PK', ` +
    `    JSON_OBJECT( ` +
          extracted[pTable].reduce(
            (acc, ident) => ([...acc, `'${ident}'`, ident]),
            []
          ).join(', ') +
    `    ) as '_Ident', ` +
    `    '${pTable}' as 'Type' ` +
    `from ${pTable} ` +
    `where ${pTable}.${pCol} = ${pk}`
  
  const query = referencedBy.reduce(
    (acc, {table: pTable, column: pCol}) => ([...acc, get_clause(pTable, pCol)]),
    []
  ).join(' UNION ALL ')

  const [records] = await connection().promise().query(query)
  return records.map(rec => {
    rec.Ident = apply_recToIndentifyBy(identifiers[rec.Type], rec._Ident)
    return rec
  })
}