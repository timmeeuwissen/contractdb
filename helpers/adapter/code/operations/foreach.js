import { treeInstructions } from "../tree";

export const o_forEach = [
  (_ctx, str) => ({
    get: () => str,
    eval: () => true,
    parse: () => str,
  }),
  [treeInstructions.TREE_RESTART]
]