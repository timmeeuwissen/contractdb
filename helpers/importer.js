import { parse } from 'csv'
import config from '~/config.json'
import { execute } from './importer/process'

export default (importType, fileDef) => {
  console.log('starting to import ', importType)
  if (!(importType in config.imports)) throw new Error(`unknown importType ${importType}`)
  if (!config.imports[importType].type == 'text/csv') throw new Error('Currently only supporting text/csv')
  
  const importConfig = config.imports[importType]

  const records = [];
  const parser = parse(importConfig.parserConfig);
  
  parser.on('readable', function(){
    let record;
    while ((record = parser.read()) !== null) {
      records.push(record);
    }
  });

  parser.on('error', function(err){
    console.error(err.message);
  });

  parser.on('end', function(){
    execute(importType, records)
  });

  parser.write(fileDef.data)
  parser.end()
}