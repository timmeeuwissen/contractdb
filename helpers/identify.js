import config from '~/config.json'
import { getUniques } from './dbSchema'

const resolvedIdentifications = {}

export const extractValues = str => [[...str.matchAll(/{{\s?(.+?)\s}}/ig)].map(rec => rec[1])]
export const get_identifiedBy = (table, vals) => {
  // when there is a template defined, apply data to that record and return
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
      const uniques = Object.values(await getUniques(database, table)).sort((a,b) => a.length < b.length)
      acc[table] = uniques[0].map(unique => '{{ ' + unique + ' }}').join(', ')
    }

    return acc
  },
  {}
)