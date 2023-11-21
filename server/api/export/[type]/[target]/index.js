import exporter from '~/helpers/exporter'
import queryableRelations from '~/helpers/queryableRelations';
import { stringify } from 'csv';
import connection from '~/helpers/connection';

// automatic exporter
// type: [API, migration, table, view, procedure]
// target: one of the values
// queryParam: format=[JSON, CSV (default)]
export default defineEventHandler(async event => { 
  const requestURL = getRequestURL(event)
  const type = event.context.params.type
  const target = (event.context.params.target || '').replaceAll(/[^A-Za-z0-9\-_\.]/gi,'')

  // data
  let data = [type];
  if (type == 'migration'){
    data = await exporter(target)
  }
  else if(
    (type  == 'table') 
    || (type  == 'view')
  ){
    const {
      records, 
    } = await queryableRelations(target)
    data = records;
  }
  else if(type == 'procedure') {
    const query = `call ${target}()`
    const [[_variables, records, _meta], definitions] = await connection().promise().query(query)
    data = records;
  }
  
  // format
  if (requestURL.searchParams.get('format') == 'JSON') {
    return data
  }
  else if (requestURL.searchParams.get('format') == 'CSV') {
    return stringify(
      data, {         
        delimiter: ",",
        escape: "\"",
        quote: "\"",
        header: true 
      }
    )
  }
  else {
    throw Error('unknown format')
  }
});
