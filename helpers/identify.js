import config from '~/config.json'
import { getUniques } from './dbSchema'

const resolvedIdentifications = {}

export const extractValues = str => [[...str.matchAll(/{{\s?(.+?)\s}}/ig)].map(rec => rec[1])]
export const get_identifiedBy = (table, vals) => {
  if (
    (table in config.tableConfiguration)
    && ('identifiedBy' in config.tableConfiguration[table])
  ) {
    return config.tableConfiguration[table].identifiedBy.apply(null, vals)
  }

  // otherwise, detect which unique fields we have, and concatenate them.
  // together they form something which makes this record unique

  // todo: get unique columns and form an identifier.
  return ''
}

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
      // todo: prioritize primary keys below the unique keys
      acc[table] = Object.entries(await getUniques(database, table)).sort((a,b) => {
        if (a[0] == 'PRIMARY') return 1
        return a[1].length < b[1].length
      })[0][1].map(unique => '{{ ' + unique + ' }}').join(', ')
    }

    return acc
  },
  {}
)

export const apply_recToIndentiedBy = (identifiedBy, rec) => 
  identifiedBy.replaceAll(
      /\{\{\s?(.*?)\s\}\}/g, 
      (_match, field) => rec[field]
    ) 