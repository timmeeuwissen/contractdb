import { collection } from "../data/collection"
import * as operations from "../code/operations"
import { tree } from "../code/tree"

const regex = /\{\{(?<operation>.+?)(?<arguments>\:)?\}\}/g

export const from = (str, coll = collection()) => {
  const codeTree = tree()
  const matches = str.matchAll(regex)
  const ctx = {
    collection: coll
  }

  if(!Object.keys(matches).length){
    codeTree.add_operation(operations.o_instruction(ctx, str))
  }
  else {
    throw new Error(JSON.stringify(matches))
  }

  return {
    collection: coll,
    codeTree,
  }
}

export const to = (collection, codeTree) => {
  let result = ''
  codeTree.traverse(operation => result += operation.get())
  return result
}