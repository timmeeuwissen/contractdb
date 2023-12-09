import { describe, test, expect, vi } from 'vitest'
import { record } from './record'
import { entity } from './entity'

describe('a record', async () => {
  describe('without the context of a collection', () => {
    test('cannot coerce values by their type', () => {
      const rec = record()
      rec.set_value('someKey', 'someValue')
      expect(rec.get()).toEqual([{},{someKey: 'someValue'}])
    })
    test('have no known PK', () => {
      const rec = record()
      rec.set_value('someKey', 'someValue')
      expect(rec.get_pkInfo().value).toBeUndefined()
    })
  })
  describe('with the context of a collection', () => {
    test('coerces to a type when in the context of an entity', () => {
      const rec = record().inject_expose(
        entity().set_attribute(  
          'intAttr', 
          // an empty type will lead up to type inference
          'integer',
        ).primary().entity()
      )

      rec.set_value('intAttr', '5')
      expect(rec.get([{'intAttr': 5}, {'intAttr': '5'}]))
    })
    test('understands that an attribute is a PK', () => {
      const fn = vi.fn((oldPK, newPK) => {
        expect(oldPK).toBeUndefined()
        expect(newPK).toEqual(5)
      })
      const rec = record(
        {update_pk: fn}
      ).inject_expose(
        entity().set_attribute(  
          'PK', 
          // an empty type will lead up to type inference
          'integer', 
          {
            relation: undefined,
            nillable: false,
            autoIncrement: true,
          }
        ).primary().entity()
      )

      rec.set_value('PK', 5)
      expect(fn).toHaveBeenCalledOnce()
    })
  })
})
