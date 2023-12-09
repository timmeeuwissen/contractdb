import { treeInstructions } from "../tree"
import { comparand_path, determineComparandType } from "./condition/comparands"
import { comp_basic } from "./condition/comparator"

export const o_condition = [
  (_ctx, sCompFrom, sComparator, sCompTo) => {
    if (!sComparator.match(comp_basic.matchRegex)) {
      throw new Error('unknown comparator')
    }
    const compInject = [comparand_path()]
    const compFrom = determineComparandType(sCompFrom, compInject)
    const compTo = determineComparandType(sCompTo, compInject)
    comp_basic.comparators[sComparator](compFrom, compTo)
    
    return {
      get: () => str,
      eval: () => true,
    }
  },
  [treeInstructions.TREE_STEP_IN]
]

export const o_else = [
  (_ctx, sCompFrom, sComparator, sCompTo) => {
    return {
      get: () => str,
      eval: () => true,
    }
  },
  [
    treeInstructions.TREE_STEP_OUT,
    treeInstructions.TREE_STEP_IN, 
  ]
]

export const o_endif = [
  (_ctx, sCompFrom, sComparator, sCompTo) => {
    return {
      get: () => str,
      eval: () => true,
    }
  },
  [
    treeInstructions.TREE_STEP_OUT,
  ]
]
export const o_if = o_condition
