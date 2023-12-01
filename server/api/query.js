import queryableRelations from '~/helpers/queryableRelations'
import { getType, getUniques } from '~/helpers/dbSchema'
import config from '~/config'

export default defineEventHandler(async event => {
  if (event.node.req.method && event.node.req.method == 'POST') {
    let status, infoString
    
    const query = await readBody(event)
    try {
      const [records, definitions] = await connection().promise().query(query)
    
      Object.keys(definitions).forEach(field => {
        if ('type' in definitions[field])
          definitions[field].typeInterpretation = getType(definitions[field].type)
      })
      
      infoString = `query fetched records`
      status = 'success'
    }
    catch(e) {
      infoString = e.message
      status = 'error'
    }
    
    const headers = [
      ...(definitions
        .filter(def => !def.name.match(/^_/))
        .reduce((acc, def) => ([
          ...acc, { 
            title: def.name, // todo: i18n mapping
            key: def.name,
            align: getType(def.type).match(/INT|LONG|DECIMAL|FLOAT/) 
              ? 'end' 
              : 'begin',
            hideable: true
          }
        ]), []))
    ]

    return {
      headers, 
      records,
      definitions,
      infoString,
      status,
    }  
  
  }
})
