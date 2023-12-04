import { describe, test, expect } from 'vitest'
import { attribute } from './attribute'
import { collection } from './collection'

describe('attributes', async () => {

  test('can be created through the constructor', () => {
    const attr = attribute('somekey')
    expect(
      attr
        .to_string()
    ).toEqual('somekey')
  })

  test('you cannot define a relation without being part of a collection', () => {
    expect(
      () => attribute('somekey', null, {relation: 'some_entity'})
    ).toThrowError()

    expect(
      () => attribute('somekey')
        .set_relation('someEntity')
    ).toThrowError()
    
    expect(
      () => collection('someCollection')
        .set_entity('someEntity')
        .set_entity('someOtherEntity')
          .set_attribute('someAttribute')
          .set_relation('someEntity')
    )
  })

  test('you cannot define a relation without being part of a collection', () => {
    expect(
      () => attribute(
        'somekey', 
        null, 
        { relation: 'some_entity' }
      )).toThrowError()
  })

  test('You can only set a type that is mapped', () => {
    expect(
      () => attribute(
        'somekey', 
        'doesntexist', 
      )
    ).toThrowError()

    expect(
      () => attribute(
        'somekey', 
        'string', 
      )
    )
  })
})