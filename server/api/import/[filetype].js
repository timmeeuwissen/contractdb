import connection from '~/helpers/connection'
import config from '~/config.json'
import { multipartToObject } from '~/helpers/formData'
import importer from '~/helpers/importer'

export default defineEventHandler(async event => {
  const importBody = await multipartToObject(event)
  console.log('IMPORT BODY', importBody)
  if (!importBody.props.importType || !importBody.files.importFile) {
    throw new Error('No import file detected')
  }
  
  importer(importBody.props.importType, importBody.files.importFile)
});


