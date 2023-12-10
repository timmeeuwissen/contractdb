import { describe, test, expect, beforeEach } from 'vitest'
import { o_bind } from './bind'
import { collection } from '../../data/collection'

describe('a binding operation', () => {
  let ctx, binding
  const 
    sPath = 'a.b',
    type = null

  beforeEach(() => {
    ctx = { collection: collection() }
    binding = o_bind(ctx, sPath, type)
  })

  test('sets entities and attributes to the collection', () => {
    expect(
      ctx.collection
        .get_entity('a')
        .get_attribute('b')
        .to_string()
    ).toEqual('b')
  })

  test('fills a bundle when requested to evaluate a record', () => {
    binding.parse('someValue')
    expect(
      ctx.collection
        .get_entity('a')
        .get_bundle()
          .to_data()
    ).toEqual([{b: 'someValue'}])
  })  
})