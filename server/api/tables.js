import connection from '~/connection'
import config from '~/config.json'

export default defineEventHandler(async event => {
  const omitFromListing = Object.entries(config.tableConfiguration).reduce(
    (acc, entry) => entry[1].ommitFromListing ? [...acc, `'${entry[0]}'`] : acc, 
    []).join(', ')
  console.log(omitFromListing);
  const [records] = await connection().promise().query(
    omitFromListing 
    ? `show tables where Tables_in_${config.connection.database} not in (${omitFromListing})` 
    : 'show tables'
  );
  return records.reduce((acc,entity) => [...acc, {tableName: Object.values(entity)[0]}],[])
})