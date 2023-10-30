import { getTemplate } from '~/helpers/importer/process'
import config from '~/config.json'

export default defineEventHandler(event => {
  if (!event.context.params.filetype) {
    throw new Error('No import file detected')
  }
  
  const { template, keyToField } = getTemplate(event.context.params.filetype)
  const tree = template.getTree(event.context.params.filetype)
  const keysToField = Object.entries(keyToField).reduce(
    (acc, [key, template]) => ({...acc, [key]: template.toString().split('.')}), {}
  )

  const importerConfig = config.imports[event.context.params.filetype]

  return { tree, keysToField, importerConfig }
});


