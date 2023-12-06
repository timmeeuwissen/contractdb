import { types } from "../data/types"

export const comparands = [
  {
    name: 'path',
    type: 'path',
    to: val => 
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
]

export const determineComparand = value => comparands.find(comparand => {
  if(comparand.test(value)) 
    return {...comparand, value}
})