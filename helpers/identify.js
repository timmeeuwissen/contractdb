import config from '~/config.json'

const resolvedIdentifications = {}

export const get_variables = (table) => {
  const extractValues = str => [[...str.matchAll(/{{\s?(.+?)\s}}/ig)].map(rec => rec[1])]
  if (
    (table in config.tableConfiguration)
    && ('identifiedBy' in config.tableConfiguration[table])
  ) {
    return extractValues(config.tableConfiguration[table].identifiedBy)
  }
  // todo: figure out the unique and return those fields
  return []
}

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