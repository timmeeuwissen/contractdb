import { determineComparand } from "./comparands"
import { comp_basic } from "./comparator"

const pathToParts = str => {
  const [entity, attribute] = str.split('.')
  return {entity, attribute}
}

export const o_instruction = (_ctx, str) => ({
  get: () => str,
  eval: () => true,
})

export const o_condition = (_ctx, sCompFrom, sComparator, sCompTo) => {
  if (!sComparator.match(comp_basic.matchRegex)) {
    throw new Error('unknown comparator')
  }
  const compFrom = determineComparand(sCompFrom)
  const compTo = determineComparand(sCompTo)
  comp_basic.comparators[sComparator](compFrom, compTo)
  
  return {
    get: () => str,
    eval: () => true,
  }
}
export const o_if = o_condition

export const o_forEach = (_ctx, str) => ({
  get: () => str,
  eval: () => true,
})

export const o_bind = ({ collection }, sPath, type=null) => {
  const { entity, attribute } = pathToParts(sPath)

  collection
    .auto_entity(entity)
    .auto_attribute(entity, type)

  return {
    get: () => str,
    eval: () => true,
  }
}