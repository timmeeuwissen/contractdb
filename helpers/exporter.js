import { generate } from 'csv'
import config from '~/config.json'
import { get_data } from './importer/reverse'

export default async (exportType) => {
  console.log('starting to import ', exportType)
  if (!(exportType in config.imports)) throw new Error(`unknown import/export Type ${exportType}`)
  
  const importConfig = config.imports[exportType]

  const records = await get_data(exportType)
  const generator = generate(importConfig.parserConfig).pipe(process.stdout);
  
}