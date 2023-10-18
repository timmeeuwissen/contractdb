import { multipartToObject } from '~/helpers/formData'
import importer from '~/helpers/importer'

export default defineEventHandler(async event => {
  const importBody = await multipartToObject(event)
  
  if (!importBody.props.importType || !importBody.files.importFile) {
    throw new Error('No import file detected')
  }
  
  console.log('invoking importers')
  importer(importBody.props.importType, importBody.files.importFile)
});


