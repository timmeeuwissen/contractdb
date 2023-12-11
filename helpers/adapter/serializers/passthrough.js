import { collection } from "../data/collection"

export const fromTemplate = (str) => {
  return codeTree.root()
}

export const toTemplate = (codeTree) => {
  const coll = collection()
  return {
    collection: coll
  }
}

export const extract = (input, codeTree) => {
  return traverseBFirst(codeTree)
}

export const construct = (collection, codeTree) => {
  let output = ''
  return output
}