export const o_bind = ({ collection }, sPath, type=null) => {
  const compPath = comparand_path()
  if(!compPath.test(sPath)) {
    throw new Error('Not a valid path provided')
  }

  const path = compPath.to(sPath)

  collection
    .auto_entity(path.entity)
    .auto_attribute(path.attribute, type)

  return {
    get: () => str,
    eval: () => true,
  }
}