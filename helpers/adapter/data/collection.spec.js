import { describe, test, expect, beforeEach } from 'vitest'
import { collection } from './collection'

describe('a collection', async () => {

  test('can be initialized with a name', () => {
    expect(
      collection('someCollection')
        .to_string()
    ).toEqual('someCollection')
  })

  describe('holds entities', async () => {
    let coll
    
    beforeEach(() => {
      coll = collection('someCollection')
    })

    test('set instances of entities can be retrieved', () => {
      const ent = coll.set_entity('someEntity')
      expect(
        coll
          .get_entity('someEntity')
          .to_string()
      ).toEqual(ent.to_string())
    })

    test('entities inherit the exposure of the collection', () => {
      expect(
        coll
          .set_entity('someEntity')
          .get_entity('someEntity')
          .to_string()
      ).toEqual('someEntity')
    })

    test('can reset the context to the collection', () => {
      expect(
        coll
          .set_entity('someEntity')
          .collection()
          .to_string()
      ).toEqual(coll.to_string())
    })

    test('you cannot set the same entity twice', () => {
      expect(
        () => coll
          .set_entity('someEntity')
          .set_entity('someEntity')
      ).toThrowError()
    })

    test('you can chain different entities though', () => {
      expect(
        () => coll
          .set_entity('someEntity')
          .set_entity('someOtherEntity')
      )
    })

    test('you can automatically create or reference the previous instance of an entity', () => {
      expect(
        coll
          .auto_entity('someEntity')
            .set_attribute('someAttribute')
          .auto_entity('someEntity')
            .get_attribute('someAttribute')
            .to_string()
      ).toEqual('someAttribute')
    })

  })

})