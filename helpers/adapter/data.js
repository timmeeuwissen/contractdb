// an empty type will lead up to type inference
export const attribute = (
  key, 
  type = null, 
  properties = {
    relation: undefined,
    nillable: true,
  }) => {
  const callbacks = []

  const expose = {
    add_callback: callback => {
      callbacks.push(callback)
    },

    // defines that a relation exists to another entity
    set_relation: ent => {
      if (!this.get_entity(ent)) {
        throw new Error('Define the entity first before referencing it')
      }
      properties.relation = ent
    },

    set_type: newType => {
      type = newType
    },

    set_nillable: newNillable => {
      properties.nillable = newNillable
    },

    primary: () => {
      this.set_primary(key)
    },

    autoIncrement: () => {
      this.set_autoIncrement(key)
    },

    // returns identifyable string for the attribute
    toString: () => key,    
  } 

  // ensure that the same logic applies, even though it's already been set
  if (type) expose.set_type(type)
  if ('relation' in properties) expose.set_relation(properties.relation)
  if ('nillable' in properties) expose.set_nillable(properties.nillable)

  return expose
}

export const entity = (name) => {
  const attrs = {}
  const uniques = {}
  let primary = null

  const expose = {
    // creates an instance of an attribute and returns this and its exposed methods
    set_attribute: () => {
      const attr = attribute.apply({...expose, ...this}, args)
      const ident = attr.toString()
      if(ident in attrs) {
        throw new Error(`Attribute ${ident} already defined`)
      }
      attrs[ident] = attr
      return {...attr, ...expose}
    },

    set_primary: (key) => {
      if (primary) throw new Error(`Cannot set primary for ${key}, already is ${primary}`)
      primary = key
    },

    set_unique: (unique, attrList) => {
      if (unique in uniques) throw new Error(`Unique `)
      attrList.forEach(attr => {
        if (!attr in attrs) throw new Error(`Attr ${attr} unknown for unique ${unique}`)
      });
    },

    // returns identifyable string for the entity
    to_string: () => name
  }
  return expose
}

export const collection = (name) => {
  const entities = {}
  const expose = {
    // creates an instance of an entity and returns this and its exposed methods
    set_entity: () => {
      const ent = entity.apply(expose, args)
      const ident = ent.toString()
      if(ident in entities) {
        throw new Error('Entity already defined')
      }
      attrs[ident] = ent
      return {...ent, ...expose}
    },

    // get the entity based on its name. If it doesn't exists, you'll get undefined back
    get_entity: ent => entities[ent],
    
    // flattens the exposure back to the collection
    collection: () => expose,
    
    // returns identifyable string for the collection
    to_string: () => name
  }
  return expose
}