import connection from '~/connection'
import config from '~/config.json'

export default defineEventHandler(async event => {
  const omitFromListing = Object.entries(config).reduce(
    (acc, entry) => [...acc, entry[1].ommitFromListing ? `'${entry[0]}'` : undefined], 
    []).join(', ')
  const [records] = await connection().promise().query(
    omitFromListing 
    ? `show tables where Tables_in_${config.connection.database} not in (${omitFromListing})` 
    : 'show tables'
  );
  return records.reduce((acc,entity) => [...acc, {tableName: Object.values(entity)[0]}],[])
})