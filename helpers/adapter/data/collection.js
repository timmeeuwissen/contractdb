import { entity } from "./entity"

// a collection contains entities with attributes, and groups an information definition set
// in comparison a database.
export const collection = (name) => {
  const entities = {}
  let expose = {
    // creates an instance of an entity and returns this and its exposed methods
    set_entity: (...args) => {
      const ent = entity.apply(null, args).inject_expose(expose)
      const ident = ent.to_string()
      if(ident in entities) {
        throw new Error('Entity already defined')
      }
      entities[ident] = ent
      return ent
    },

    // get the entity based on its name. If it doesn't exists, you'll get undefined back
    get_entity: ent => entities[ent],

    // automatically create for convenience
    auto_entity: (ident, ...args) => expose.get_entity(ident) || expose.set_entity.apply(null, [ident, ...args]),
    
    // flattens the exposure back to the collection
    collection: () => expose,
    
    // returns identifyable string for the collection
    to_string: () => name,
  }
  return expose
}