export const treeInstructions = Object.freeze([
  'TREE_STEP_IN',
  'TREE_STEP_OUT',
  'TREE_RESTART',
].reduce((acc, val) => ({...acc, [val]: val}), {}))

export const tree = (injectExpose = {}) => {
  const parts = []
  const expose = {

    add_operation: (opDef, operationArguments = []) => {
      const [operation, instructions = []] = Array.isArray(opDef)
        ? opDef
        : [opDef]

      const stepOut = instructions.findIndex(instruction => instruction == treeInstructions.TREE_STEP_OUT)
      if(stepOut > -1) {
        const filteredInstructions = instructions
        delete filteredInstructions[stepOut]
        return injectExpose.stepOut().add_operation([
          operation,
          filteredInstructions
        ], operationArguments)
      }
          
      const part = {
        operation: operation,
        instructions,
        operationArguments,
        children: tree({
          root: expose.root,
          stepOut: () => ({
            ...expose,
            stepIn: () => part.children,
          }),        
        })
      }
      parts.push(part)
      
      let result = {
        ...expose, 
        stepIn: () => part.children,
      }

      instructions.every(instruction => {
        if(instruction == treeInstructions.TREE_STEP_IN) {
          // const filteredInstructions = instructions
          // delete filteredInstructions[instructions.findIndex(instruction => instruction == treeInstructions.TREE_STEP_IN)]
          result = part.children
          return false
        }
        return true
      });

      return result
    },

    traverse: (cb, ctx = {}) => {
      let continueLayer = true
      ctx.stepOut = () => continueLayer = false
      
      parts.every((part, idx) => {
        let stepIn = true
        ctx.preventStepIn = () => stepIn = false
        
        const newCtx = expose.constructCtx(ctx, idx)
        
        const result = cb(newCtx, part.operation, part.operationArguments)
        
        if(continueLayer && stepIn) {
          part.children.traverse(
            cb, 
            {
              ...newCtx,
              chain: [...newCtx.chain, {part, result}]
            }
          )
        }
        return continueLayer
      })
      return expose
    },

    getParts: () => parts,
    
    constructCtx: (ctx, idx) => ({
      ...ctx,
      chain: ctx.chain || [],
      lookAround: {
        idx,
        next: () => parts[idx+1],
        previous: () => parts[idx-1],
        ancestor: () => ctx.chain.length ? ctx.chain[ctx.chain.length - 1] : undefined,
        findNext: (op) => parts.slice(idx+1).find(val => op.name == val.operation.name),
        findPrevious: (op) => parts.slice(undefined, idx-1).find(val => op.name == val.operation.name),
        findAncestor: (op) => ctx.chain 
          ? ctx.chain.find(ancestor => ancestor.part.operation.name == op.name) 
          : undefined,
      }
    }),

    root: () => expose,

    ...injectExpose,
  }
  return expose
}