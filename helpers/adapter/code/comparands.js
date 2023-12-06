import { types } from "../data/types"

export const comparands = [
  {
    name: 'path',
    type: 'path',
    test: val => val.match(/^(?<entity>[a-zA-Z0-9_\-]+)\.(?<attribute>[a-zA-Z0-9_\-]+)$/),
  },
  ... Object.entries(types).reduce(
    (acc, [type, transformations]) => {
      if(transformations.test) {
        acc.push(
          {
            name: type,
            type,
            ...transformations
          }
        )
      }
      return acc
    }, 
    []
  ),
  {
    name: 'string',
    type: 'string',
    test: () => true
  },
]

export const determineComparand = value => comparands.find(comparand => {
  if(comparand.test(value)) 
    return {...comparand, value}
})