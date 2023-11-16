import { parse } from 'csv'
import config from '~/config.json'
import { execute } from './importer/process'

export default (APIType, fileDef) => {
  if (!(APIType in config.imports)) throw new Error(`Unknown API ${importType}`)
  if (!config.API[APIType].type == 'JSON') throw new Error('Currently only supporting JSON')
  
  execute(config.API[APIType].modelMap)
  return {
    fileStats,
    databaseStats
  }
}