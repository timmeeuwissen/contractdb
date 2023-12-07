export const tree = (injectExpose = {}) => {
  const parts = []
  const expose = {

    add_operation: (operation) => {
      const part = {
        operation,
        children: tree({
          root: expose.root,
          stepOut: () => expose,        
        })
      }
      parts.push(part)
      return {
        ...expose, 
        stepIn: () => part.children,
      }
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