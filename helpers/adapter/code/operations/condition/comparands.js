import { typeArray } from "../../../data/types"


export const comparand_path = () => ({
  type: 'path',
  to: val => {
    const [attribute, entity, collection = null] = val.split('.').reverse()
    return {collection, entity, attribute}
  },
  from: val => [val.collection, val.entity, val.attribute].filter().join('.'),
  test: val => val.match(/^(?<collection>[a-zA-Z0-9_\-]+)?\.?(?<entity>[a-zA-Z0-9_\-]+)\.(?<attribute>[a-zA-Z_\-]+)$/),
})

export const determineComparandType = (value, comparandInject = []) => 
    [...comparandInject, ...typeArray].find(comparand => {
  if(comparand.test(value)) 
    return {...comparand, value}
})