export const types = {
  'integer': Number,
  'date': Date,
  'string': String,
}

// an attribute can be seen as a property of an entity
// in comparison, a column of a table
export const attribute = (
  key, 
  // an empty type will lead up to type inference
  type = null, 
  properties = {
    relation: undefined,
    nillable: true,
    autoIncrement: false,
  }) => {
  const callbacks = []

  let expose = {
    add_callback: callback => {
      callbacks.push(callback)
    },

    // defines that a relation exists to another entity
    set_relation: ent => {
      if (!expose.get_entity) {
        throw new Error('Cannot define a relation without being part of a collection')
      }
      if (!this.get_entity(ent)) {
        throw new Error('Define the entity first before referencing it')
      }
      properties.relation = ent
    },

    set_type: newType => {
      if (newType && !(newType in types)) throw new Error(`unknown type ${type}`)
      type = newType
      return expose
    },

    set_nillable: newNillable => {
      properties.nillable = newNillable
      return expose
    },

    primary: () => {
      if(!expose.set_primary) 
        throw new Error(`cannot set the this attribute as primary while not being part of an entity`)
      expose.set_primary(key)
      return expose
    },

    autoIncrement: newAutoIncrement => {
      properties.autoIncrement = newAutoIncrement
      return expose
    },

    // enable chaining
    inject_expose: exp => { 
      expose = {...exp, ...expose}
      return expose
    },

    // returns identifyable string for the attribute
    to_string: () => key,    
  } 

  // ensure that the same logic applies, even though it's already been set
  if (type) expose.set_type(type)
  if ('relation' in properties && properties.relation) expose.set_relation(properties.relation)
  if ('nillable' in properties) expose.set_nillable(properties.nillable)
  if ('autoIncrement' in properties) expose.set_nillable(properties.autoIncrement)

  return expose
}


