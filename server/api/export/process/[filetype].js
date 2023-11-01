import exporter from '~/helpers/exporter'

export default defineEventHandler(async event => {  
  const csv = await exporter(event.context.params.filetype)
  return csv
});


