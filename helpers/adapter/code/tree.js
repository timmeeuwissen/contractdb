export const tree = () => {
  const parts = []
  const expose = {
    add_operation: (operation) => {
      const children = tree()
      parts.push(
        {
          operation,
          children
        }
      )
      return {
        ...expose, 
        stepIn: children,
        stepOut: expose,
      }
    },
    traverse: (cb) => {
      parts.forEach(part => {
        cb(part.operation)
        part.children.traverse(cb)
      })
    }
  }
  return expose
}