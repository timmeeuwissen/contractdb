import { get_tableDescription } from "./dbSchema";
import columnDecoders from './dbCommentConfig/columnDecoders'

const decodeComments = comment => ([
  ...comment
    .matchAll(/(?<decoder>.+?)\[(?<arguments>.+?)\],?/g)
  ]
  .reduce((acc, match) => ({
    ...acc,
    [match.groups.decoder]: String(match.groups.arguments).split(',')
  }), {}))

export const decode_columns = async (database, tableName) => {
  const tableDescription = await get_tableDescription(database, tableName)
  const result = {}
  
  Object.entries(tableDescription).forEach(([Field, column]) => {
    const decoded = decodeComments(String(column.Comment))
    Object.entries(columnDecoders).forEach(([decoderName, Decoder]) => {
      const decoder = Decoder()
      if((decoder.prefixMatch in decoded) && (decoder.matched)) {
        // there's an instruction
        result[decoderName] = decoder.matched(
          decoded[decoder.prefixMatch], 
          Field, 
          result[decoderName]
        )
      }
      else if(decoder.unmatched) {
        // there's no instruction
        result[decoderName] = decoder.unmatched(
          column.Field, 
          result[decoderName]
        )
      }
    })
  })
  
  // when done, allow each decoder to post process
  const final =  Object.entries(result).reduce((acc, [decoderName, results]) => {
    const decoder = columnDecoders[decoderName]()
    return {
      ...acc,
      [decoderName]: decoder.postProcess
        ? decoder.postProcess(tableDescription, results)
        : results
    }
  }, {})
  
  return final
}