import { collection } from "../data/collection"
import operations from "../code/operations"
import { tree } from "../code/tree"
import { get_collectionFromCodeTree } from "../serializer"

const strToParts = str => str.split(/(\{\{.*?\}\})/)
const strToOperation = str => str.match(/^\{\{(?<operation>[^:]+):?(?<arguments>.*)?\}\}/)
const strToArgs = str => str.split(':')


export const fromTemplate = (str) => {
  let codeTree = tree()
  const parts = strToParts(str)
  
  parts.forEach(part => {
    const operation = strToOperation(part)
    if(!operation){
      codeTree = codeTree.add_operation(operations.o_instruction, [part])
    }
    else {
      const [ match, opName, strArgs = '' ] = operation
      if (!(`o_${opName}` in operations)) 
        throw new Error(`Nonexisting operation '${opName}' invoked with ${match}`)
      const args = strToArgs(strArgs)
      codeTree = codeTree.add_operation(operations[`o_${opName}`], args)
    }
  })

  return codeTree.root()
}

export const toTemplate = (codeTree) => {
  let result = ''
  const coll = collection()
  codeTree.traverse(
    (ctx, operation, operationArguments) => {
      let op = operation.apply(null, [ctx, ...operationArguments])
      let subResult = op.get ? op.get() : ''
      if (op.implicit) {
        result += subResult
      }
      else {
        result += '{{' + [operation.name.replace(/^o_/,''), ...operationArguments].join(':') + '}}'
      }
    },
    {
      collection: coll
    }
  )
  return {
    collection: coll
  }
}

export const extract = (input, codeTree) => {
  let result = ''
  const coll = get_collectionFromCodeTree(codeTree)
  codeTree.traverse(
    (ctx, operation, operationArguments) => {
      let op = operation.apply(null, [ctx, ...operationArguments])
      let subResult = op.get ? op.get() : ''
      if (op.implicit) {
        result += subResult
      }
      else {
        result += '{{' + [operation.name.replace(/^o_/,''), ...operationArguments].join(':') + '}}'
      }
    },
    {
      collection: coll
    }
  )
  return {result}

}

// todo : deal with multiple outputs if they'd occur.
export const construct = (collection, codeTree) => {
  let output = ''
  const coll = get_collectionFromCodeTree(codeTree)
  codeTree.traverse(
    (ctx, operation, operationArguments) => {
      let op = operation.apply(null, [ctx, ...operationArguments])
      let subResult = op.eval()
      output += subResult
    },
    {
      collection: collection()
    }
  )
  return output
}