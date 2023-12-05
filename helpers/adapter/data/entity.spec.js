import { describe, test, expect, beforeEach } from 'vitest'
import { entity } from './entity'

describe('an entity', async () => {

  test('can be initialized with a name', () => {
    expect(
      entity('someEntity')
        .to_string()
    ).toEqual('someEntity')
  })

  describe('holds attributes', async () => {
    let ent
    
    beforeEach(() => {
      ent = entity('someEntity')
    })

    test('set attributes can be retrieved', () => {
      const att = ent.set_attribute('someAttribute')
      expect(
        ent
          .get_attribute('someAttribute')
          .to_string()
      ).toEqual(att.to_string())
    })

    test('attributes inherit the exposure of the entity', () => {
      expect(
        ent
          .set_attribute('someAttribute')
          .get_attribute('someAttribute')
          .to_string()
      ).toEqual('someAttribute')
    })

    test('can reset the context to the entity', () => {
      expect(
        ent
          .set_attribute('someAttribute')
          .entity()
          .to_string()
      ).toEqual(ent.to_string())
    })

    test('a primary key should exist before being allocated', () => {
      expect(
        () => ent
          .set_primary('nonExistingAttribute')
          .to_string()
      ).toThrowError()
    })

    test('you can only have one primary key assigned', () => {
      expect(
        ent
          .set_attribute('someAttribute')
          .entity()
          .set_primary('someAttribute')
          .to_string()
      )
      expect(
        () => ent
          .set_attribute('someOtherAttribute')
          .entity()
          .set_primary('someOtherAttribute')
      ).toThrowError()
    })

    test('you can automatically create or reference the previous instance of an attribute', () => {
      expect(
        ent
          .auto_attribute('someAttribute')
            .primary()
          .auto_attribute('someAttribute')
          .get_primary()
            .to_string()
      ).toEqual('someAttribute')
    })

  })

})