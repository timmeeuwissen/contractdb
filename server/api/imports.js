import config from '~/config.json'

export default defineEventHandler(async () => {
  return Object.keys(config.imports).reduce((acc, importType) => {
    return {...acc, [importType]: config.imports[importType]}
  }, {})
})