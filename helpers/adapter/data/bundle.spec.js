import { expect, beforeEach, describe, test } from 'vitest'

import { collection } from './collection'
import { bundle } from './bundle'

describe('a bundle', async () => {
  let coll = collection()
  let bndl = bundle()
  beforeEach(() => {
    coll = collection()
      .set_entity('someEnt')
      .set_attribute('someAttr', 'passthrough')
      .set_attribute('pk', 'integer')
        .primary()
      .collection()
    bndl = coll.get_entity('someEnt').get_bundle()
  })

  test('can add a record', () => {
    const rec = bndl
      .add_record()
      .set_value('someAttr', 'attrValue')
    expect(rec.get()).toEqual([
      {someAttr: 'attrValue'}, 
      {someAttr: 'attrValue'}
    ])
  })
  test('PK management maintains a correct state', () => {
    const bundl = bndl
      .add_record()
      .set_value('pk', '6')
      .bundle()
    expect(bndl.get_records_with_pk()).toEqual({'6': bndl.get_record('6')})
    expect(bndl.get_records_without_pk()).toEqual({})

  })
  test('can chain adding records', () => {})
  test('have no known PK', () => {})
  test('records can be found per PK', () => {})
  test('can revert to the bundle context after setting a record value', () => {})
})
