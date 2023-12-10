import { comparand_path } from "./condition/comparands"

// todo : binding to a record type (e.g parent versus child)
// todo : binding to an entity, which later forms the root for the attributes
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
    get: () => {
      // todo : deal with prior bindings
      const bundle = collection.get_entity(path.entity).get_bundle()
      const records = bundle.get_records()
      const record = records.shift()
      if (!record) return undefined
      const [data, _dataOrigin] = record.get()
      if (path.attribute in data) {
        return data[path.attribute]
      }
      return undefined
    },
    eval: () => true,
    parse: (data) => {
      collection
        .get_entity(path.entity)
        .get_bundle()
          .add_record()
            .set_value(path.attribute, data)
      return true
    },
  }
}