export const treeInstructions = Object.freeze([
  'TREE_STEP_IN',
  'TREE_STEP_OUT',
  'TREE_RESTART',
].reduce((acc, val) => ({...acc, [val]: val}), {}))

export const tree = (injectExpose = {}) => {
  const parts = []
  const expose = {

    add_operation: (opDef) => {
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
        ])
      }
          
      const part = {
        operation: operation,
        instructions,
        children: tree({
          root: expose.root,
          stepOut: () => expose,        
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
      if(!('chain' in ctx)) ctx.chain = []
      let continueLayer = true
      ctx.stepOut = () => continueLayer = false
      
      parts.every(part => {
        let stepIn = true
        ctx.preventStepIn = () => stepIn = false
        cb(ctx, part.operation)
        if(continueLayer && stepIn) {
          part.children.traverse(cb, {
            chain: [part.operation, ...ctx.chain]
          })
        }
        return continueLayer
      })
      return expose
    },

    root: () => expose,

    ...injectExpose,
  }
  return expose
}