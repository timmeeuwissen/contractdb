import { record } from "./record"

export const bundle = () => {
  const 
    recordsByPK = {},
    recordsWithoutPK = {}
  let highestUnknown = 0

  let expose = {
    add_record: () => {
      let rec
      let withoutPKPos
      const listeners = {
        update_pk: (oldPK, newPK) => {
          if (typeof oldPK != 'undefined') {
            delete recordsByPK[oldPK]
          }
          else {
            delete recordsWithoutPK[withoutPKPos]
          }
          if (typeof newPK != 'undefined') {
            recordsByPK[newPK] = rec
          } 
          else {
            highestUnknown += 1
            withoutPKPos = highestUnknown
            recordsWithoutPK[withoutPKPos] = rec
          }
        }
      }
      rec = record(listeners).inject_expose(expose)
      listeners.update_pk(undefined, undefined)
      
      return rec
    },
    
    get_record: pk => recordsByPK[pk],
    get_records_without_pk: () => recordsWithoutPK,
    get_records_with_pk: () => recordsByPK,
    get_records: () => [...recordsWithoutPK, ...Object.values(recordsByPK)],
    bundle: () => expose,

    // enable chaining
    inject_expose: exp => {
      expose = {...exp, ...expose}
      return expose
    },

  }
  return expose 
}