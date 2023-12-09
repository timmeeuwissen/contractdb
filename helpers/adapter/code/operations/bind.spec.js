import { describe, test, expect } from 'vitest'
import { o_bind } from './bind'
import { collection } from '../../data/collection'

describe('a binding operation', () => {
  const ctx = { collection: collection() },
    sPath = 'a.b',
    type = null
  
  const binding = o_bind(ctx, sPath, type)

  test('sets entities and attributes to the collection', () => {
    expect(
      ctx.collection
        .get_entity('a')
        .get_attribute('b')
        .to_string()
    ).toEqual('b')
  })
  
})