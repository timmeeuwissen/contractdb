import { get_template } from '~/helpers/modelMapper'
import config from '~/config.json'
import { get_tableDescription } from '~/helpers/dbSchema';

export default defineEventHandler( async event => {
  if (!event.context.params.filetype) {
    throw new Error('No import file detected')
  }
  const importerType = event.context.params.filetype
  const { template, keyToField } = get_template(config.imports[importerType].modelMap)
  const keysToField = await Object.entries(config.imports[importerType].modelMap).reduce(
    async (acc, [key, fieldConfig]) => 
      {
        if(key in keyToField) {
          const template = keyToField[key]
          const {database: fieldDB, table: fieldTBL, field: fieldCOL} = template.getMeta()
          template.setProperties((await get_tableDescription(fieldDB, fieldTBL))[fieldCOL])
    
          return {
            ...(await acc), 
            [key]: {
              mapped: true,
              column: key,
              path: template.toString().split('.'),
              properties: template.getProperties()
            }
          }
        }
        else {
          return {
            ...(await acc),
            [key]: {
              mapped: false,
              config: fieldConfig
            }
          }
        }
      }, 
    {}
  )
  const tree = template.getTree(event.context.params.filetype)

  const importerConfig = config.imports[event.context.params.filetype]
  return { tree, keysToField, importerConfig }
});


