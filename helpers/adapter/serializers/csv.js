import { collection } from "../data/collection"
import { tree } from "../code/tree"
import { matchers } from "./csv.matchers"

export const fromTemplate = (input) => {
  const maxHits = 100
  let codeTree = tree(),
    hits = 0,
    str = input,
    lineState = true
  while(str.length && (hits++ < maxHits)) {
    matchers.find(([name, re, toTree]) => {
      const match = re.exec(str)
      if(match) {
        if(match.index != 0)
          throw new Error(
            `Oops, didn't match from position 0, ` +
            `matched ${name} found ${match[0]} ` + 
            `start=${match.index} end=${match.lastIndex} ` + 
            `on ${str}.`
          )
        const startOfLine = lineState
        lineState = false,
        codeTree = toTree(name, codeTree, match, {
          startOfLine,
          signalEndOfLine: () => { lineState = true }
        })
        str = str.substring(match[0].length)
      }
      return match
    })
  }

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