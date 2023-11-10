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

  const fileStats = {
    records: 0,
    errors: [],
  }
  
  let databaseStats;
  
  parser.on('readable', function(){
    let record;
    while ((record = parser.read()) !== null) {
      records.push(record);
      fileStats.records++
    }
  });

  parser.on('error', function(err){
    fileStats.errors.push(err.message)
  });

  parser.on('end', function(){
    try {
      databaseStats = {
        status: 'success',
        ...execute(importType, records)
      }
    }
    catch(err) {
      databaseStats = {
        status: 'failed',
        reason: err.message 
      }
    }
  });

  parser.write(fileDef.data)
  parser.end()

  return {
    fileStats,
    databaseStats
  }
}