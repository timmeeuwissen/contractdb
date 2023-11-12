import { getConstraintsForTable, get_tableDescription, get_tableIndices } from "~/helpers/dbSchema"
import config from "~/config.json"

export default defineEventHandler(async event => {
  const tableName = event.context.params.table.replaceAll(/[^a-z]/ig,'');

  return {
    columns: await get_tableDescription(config.connection.database, tableName),
    relations: await getConstraintsForTable(tableName),
    indices:  await get_tableIndices(config.connection.database, tableName),
  }
})