import { attribute } from "./attribute"

// an entity can be seen as something that has attributes and is part of a collection
// in comparison, a table of a database
export const entity = (name) => {
  const attrs = {}
  const uniques = {}
  let primary = null

  let expose = {
    // creates an instance of an attribute and returns this and its exposed methods
    set_attribute: (...args) => {
      const attr = attribute.apply(null, args).inject_expose(expose)
      const ident = attr.to_string()
      if(ident in attrs) {
        throw new Error(`Attribute ${ident} already defined`)
      }
      attrs[ident] = attr
      return attr
    },

    get_attribute: attr => attrs[attr],

    // automatically create for convenience
    auto_attribute: (ident, ...args) => expose.get_attribute(ident) || expose.set_attribute.apply(null, [ident, ...args]),
    
    set_primary: (ident) => {
      if (primary) throw new Error(`Cannot set primary for ${ident}, already is ${primary}`)
      if (!(ident in attrs)) throw new Error(`Unnknown attribute ${ident}`)
      primary = attrs[ident]
      return expose
    },

    get_primary: () => primary,

    set_unique: (unique, attrList) => {
      if (unique in uniques) throw new Error(`Unique `)
      attrList.forEach(attr => {
        if (!attr in attrs) throw new Error(`Attr ${attr} unknown for unique ${unique}`)
      });
    },

    // enable chaining
    inject_expose: exp => {
      expose = {...exp, ...expose}
      return expose
    },

    entity: () => expose,
    
    // returns identifyable string for the entity
    to_string: () => name,
  }
  return expose
}
