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
  const traverseBFirst = (codeTree, ctx = null) => {
    // the space between implicit operations is parsed by each other op
    // first we find the next implicit demarkation, and apply what's to be
    // found to the evaluable operands and their children.
    let startIndex = 0
    let curStr = '',
      nextStr = input
    if(!ctx) {
      ctx = {
        collection: collection()
      }
    }
    // todo create iterable to step through these parts
    const parts = codeTree.getParts().reduce(
      (acc, part, idx) => {
        let newCtx = codeTree.constructCtx(ctx, idx)
        return [
          ...acc, 
          {
            ...part, 
            execOp: part.operation.apply(null, [newCtx, ...part.operationArguments])
          }
        ]
      }, 
      []
    )
    
    let implicitIndex = 0
    do {      
      implicitIndex = parts.findIndex((part, idx) => idx >= startIndex && part.execOp.implicit)
      if (implicitIndex > -1) {
        const implicitVal = parts[implicitIndex].execOp.get()
        const strParts = nextStr.split(implicitVal,2)
        if (strParts.length < 2) {
          throw new Error(`Could not find an occurrance of '${implicitVal}' within '${nextStr}'`)
        }
        [curStr, nextStr] = strParts
      }
      else {
        [curStr, nextStr] = [nextStr, curStr]
      }
      
      const handout = parts.slice(startIndex, implicitIndex)
      handout.forEach(part => {
        debugger
        const result = part.execOp.parse(curStr)
        const childCtx = {...ctx, chain: [...(ctx.chain || []), {part, result}]}
        traverseBFirst(part.children, childCtx)
      })
      
      startIndex = implicitIndex + 1

    } while (implicitIndex > -1)

    return ctx
  }

  return traverseBFirst(codeTree)

}

// todo : deal with multiple outputs if they'd occur.
export const construct = (collection, codeTree) => {
  let output = ''
  codeTree.traverse(
    (ctx, operation, operationArguments) => {
      let op = operation.apply(null, [ctx, ...operationArguments])
      let subResult = op.get()
      output += subResult
    },
    {
      collection
    }
  )
  return output
}