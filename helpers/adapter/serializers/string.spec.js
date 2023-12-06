import { describe, test, expect, beforeEach } from 'vitest'
import { from, to } from './string'

describe('a string', async () => {

  test('when nothing interprets, nothing changes', () => {
    const {collection, codeTree} = from('someString')
    expect(
      to(collection, codeTree)
    ).toEqual('someString')
  })

  test('when there is a binding, it is amended to the collection', () => {
    const {collection, codeTree} =  from('string {{bind:entityName.attributeName}} binding')
    expect(
      collection
        .get_entity('entityName')
        .get_attribute('attributeName')
    )
  })
})
