import { collection } from "./data/collection"

export const get_collectionFromCodeTree = codeTree => {
  const coll = collection()
  codeTree.traverse(
    (ctx, operation, operationArguments) => {
      let op = operation.apply(null, [ctx, ...operationArguments])
      codeTree.traverse(
        (ctx, operation, operationArguments) => operation.apply(null, [ctx, ...operationArguments]),
        {
          collection: coll
        }
      )
      return coll
    },
    {
      collection: coll
    }
  )
  return coll
}