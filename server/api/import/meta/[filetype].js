import { getTemplate } from '~/helpers/importer/process'

export default defineEventHandler(event => {
  if (!event.context.params.filetype) {
    throw new Error('No import file detected')
  }
  
  const tree = getTemplate(event.context.params.filetype).getTree(event.context.params.filetype)
  return tree
});


