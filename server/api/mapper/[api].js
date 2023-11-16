import modelAPI from '~/helpers/modelAPI'

export default defineEventHandler(async event => {
  const importBody = await multipartToObject(event)

  if (!event.context.params.api) {
    throw new Error('No Mapper-API detected')
  }

  return modelAPI(event.context.params.api)
});