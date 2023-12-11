import { collection } from "../data/collection"

export const fromTemplate = (str) => {
  return codeTree.root()
}

export const toTemplate = ({collection, codeTree}) => {
  let result = ''
  return {
    result,
    collection,
  }
}

export const extract = (input, codeTree) => {
  return traverseBFirst(codeTree)
}

export const construct = (collection, codeTree) => {
  let output = ''
  return output
}