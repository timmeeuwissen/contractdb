import { types } from "./types"

export const recordInstructions = Object.freeze([
  'RECORD_PK_SET',
  'RECORD_PK_AUTO',
  'RECORD_PK_UNDEFINED',
].reduce((acc, val) => ({...acc, [val]: val}), {}))

export const record = (listeners = {}) => {
  const 
    recOriginal = {}
  
  const pk = {
    attr: undefined,
    type: recordInstructions.RECORD_PK_UNDEFINED,
    value: undefined,
  }

  let expose = {
    set_value: (key, value) => {
      if (pk.attr == key && 'update_pk' in listeners) {
        listeners.update_pk(
          pk.value,
          value
        )
        pk.type = recordInstructions.RECORD_PK_SET,
        pk.value = value
      }
    
      recOriginal[key] = value
      return expose
    },
    // todo : understand the dynamics of uniques
    get: () => ([
      Object.entries(recOriginal).reduce(
        (acc, [key, value]) => {
          if('get_attribute' in expose) {
            const type = expose.get_attribute(key).get_type()
            if (!(type in types)) {
              throw new Error(`Attribute has a type set which cannot be found in type definitions`)
            }
            acc[key] = types[type].to(value)
          }
          return acc
        }, 
        {}
      ), 
      recOriginal
    ]),

    get_pkInfo: () => pk,

    // enable chaining
    inject_expose: exp => {
      expose = {...exp, ...expose}
      if ('get_primary' in expose) {
        pk.attr = expose.get_primary().to_string()
      }
     return expose
    },

    to_string: () => pk.value.toString(),
    
  }

  return expose
}