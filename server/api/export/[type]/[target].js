// automatic exporter
// type: [API, migration, table, view, procedure]
// target: one of the values
// queryParam: format=[JSON, CSV (default)]

import exporter from '~/helpers/exporter'

export default defineEventHandler(async event => { 
  const requestURL = getRequestURL(event)

  // data
  let data = [];
  if (event.context.params.type == 'migration'){
    data = await exporter(event.context.params.target)
  }
  else if(event.context.params.type in ['table', 'view']){
    const {
      records, 
    } = await queryableRelations(tableName)
    data = records;
  }
  
  // format
  if (requestURL.searchParams.get('format') == 'JSON') {
    return data
  }
  else if (requestURL.searchParams.get('format') == 'CSV') {
    return data
  }
  else {
    throw Error('unknown format')
  }
});
