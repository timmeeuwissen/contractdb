import { collection } from "../data/collection"
import * as operations from "../code/operations"
import { tree } from "../code/tree"

const strToParts = str => str.split(/(\{\{.*?\}\})/)
const strToOperation = str => str.match(/^\{\{(?<operation>[^:]+):?(?<arguments>.*)?\}\}/)
const strToArgs = str => str.split(':')


export const from = (str, coll = collection()) => {
  const codeTree = tree()
  const parts = strToParts(str)
  
  const ctx = {
    collection: coll
  }

  parts.forEach(part => {
    const operation = strToOperation(part)
    if(!operation){
      codeTree.add_operation(operations.o_instruction(ctx, part))
    }
    else {
      const [ match, opName, strArgs ] = operation
      if (!(`o_${opName}` in operations)) 
        throw new Error(`Nonexisting operation '${opName}' invoked with ${match}`)
      const args = strToArgs(strArgs.toString())
      codeTree.add_operation(operations[`o_${opName}`].apply(null, [ctx, ...args]))
    }
  })

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