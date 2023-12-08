import { treeInstructions } from "../tree";

export const o_forEach = [
  (_ctx, str) => ({
    get: () => str,
    eval: () => true,
  }),
  [treeInstructions.TREE_RESTART]
]