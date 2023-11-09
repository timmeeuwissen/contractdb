import { getTemplate } from '~/helpers/importer/process'
import config from '~/config.json'
import { get_tableDescription } from '~/helpers/dbSchema';

export default defineEventHandler( async event => {
  if (!event.context.params.filetype) {
    throw new Error('No import file detected')
  }
  
  const { template, keyToField } = getTemplate(event.context.params.filetype)
  const keysToField = await Object.entries(keyToField).reduce(
    async (acc, [key, template]) => 
      {
        const {database: fieldDB, table: fieldTBL, field: fieldCOL} = template.getMeta()
        template.setProperties((await get_tableDescription(fieldDB, fieldTBL))[fieldCOL])
  
        return {
          ...(await acc), 
          [key]: {
            column: key,
            path: template.toString().split('.'),
            properties: template.getProperties()
          }
        }
      }, 
    {}
  )
  const tree = template.getTree(event.context.params.filetype)

  const importerConfig = config.imports[event.context.params.filetype]
  return { tree, keysToField, importerConfig }
});


