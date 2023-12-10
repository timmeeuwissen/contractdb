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
    const rec = bndl
      .add_record()
        .set_value('someAttr', 'attrValue')
    expect(bndl.get_records_with_pk()).toEqual({})
    expect(bndl.get_records_without_pk()[1].get()[0]).toEqual({someAttr: 'attrValue'})

    rec
      .set_value('pk', '6')
    expect(bndl.get_records_with_pk()['6'].get()[0]).toEqual({someAttr: 'attrValue', pk: 6})
    expect(bndl.get_records_without_pk()).toEqual({})
  })
  
  test('records can be found per PK', () => {
    const rec = bndl
      .add_record()
        .set_value('someAttr', 'attrValue')
        .set_value('pk', '1')
    expect(bndl.get_record('1')).toEqual(rec)
  })


  test('can chain adding records', () => {
    bndl
      .add_record()
        .set_value('someAttr', 'attrValue')
        .set_value('pk', '1')
      .add_record()
        .set_value('someAttr', 'otherAttrValue')
        .set_value('pk', '2')

    expect(bndl.get_record('1').get()[0]).toEqual({pk: 1, someAttr: 'attrValue'})
    expect(bndl.get_record('2').get()[0]).toEqual({pk: 2, someAttr: 'otherAttrValue'})
  })

  test('can revert to the bundle context after setting a record value', () => {
    const bundl = bndl
      .add_record()
        .set_value('someAttr', 'attrValue')
        .set_value('pk', '1')
      .bundle()
    expect('set_value' in bundl).toBeFalsy()
  })
  
  test('bundles can spew out their contents in plain json objects', () => {
    const data = bndl
      .add_record()
        .set_value('someAttr', 'attrValue')
        .set_value('pk', '1')
      .add_record()
        .set_value('someAttr', 'otherAttrValue')
        .set_value('pk', '2')
      .to_data()
  
    expect(data).toEqual([
      {someAttr: 'attrValue', pk: 1}, 
      {someAttr: 'otherAttrValue', pk: 2}
    ])
  })

  test('since we return references to objects, mass operations should be simple', () => {
    bndl
      .add_record()
        .set_value('someAttr', 'attrValue')
      .add_record()
        .set_value('someAttr', 'otherAttrValue')
      .add_record()
        .set_value('someAttr', 'yetAnotherAttrValue')
    
    Object.values(bndl.get_records_without_pk())
      .forEach((rec, idx) => rec.set_value('pk', idx+1))  
  
    expect(bndl.to_data()).toEqual([
      {someAttr: 'attrValue', pk: 1}, 
      {someAttr: 'otherAttrValue', pk: 2},
      {someAttr: 'yetAnotherAttrValue', pk: 3},
    ])

    expect(bndl.get_records_without_pk()).toEqual({})
  })

})
