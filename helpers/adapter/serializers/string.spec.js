import { describe, test, expect, beforeEach, vi } from 'vitest'
import { fromTemplate, toTemplate, extract, construct } from './string'
import { o_instruction } from '../code/operations/instruction'
import { o_bind } from '../code/operations/bind'
import { get_collectionFromCodeTree } from '../serializer'
import { collection } from '../data/collection'

describe('a string', async () => {

  test('when nothing interprets, non-interpretations are consumed as instructions', () => {
    const codeTree = fromTemplate('someString')
    const fn = vi.fn()
    codeTree.traverse(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn.mock.lastCall[0].chain).toEqual([])
    expect(fn.mock.lastCall[1]).toEqual(o_instruction)
})

  test('when there is a binding, it is amended to the collection', () => {
    const codeTree = fromTemplate('string {{bind:entityName.attributeName}} binding')
    const fn = vi.fn()
    codeTree.traverse(fn)
    expect(fn).toHaveBeenCalledTimes(3)
    
    expect(fn.mock.calls[0][0].chain).toEqual([])
    expect(fn.mock.calls[0][1]).toEqual(o_instruction)

    expect(fn.mock.calls[1][0].chain).toEqual([])
    expect(fn.mock.calls[1][1]).toEqual(o_bind)

    expect(fn.mock.calls[2][0].chain).toEqual([])
    expect(fn.mock.calls[2][1]).toEqual(o_instruction)

    // expect(
    //   collection
    //     .get_entity('entityName')
    //     .get_attribute('attributeName')
    // )
  })

  test('we can reconstruct the original template from the code tree', () => {
    const template = 'string {{bind:entityName.attributeName}} binding'
    const codeTree = fromTemplate(template)
    const reconstructed = toTemplate({collection: collection(), codeTree})
    expect(reconstructed.result).toEqual(template)
  })

  test('We can extract data from the string providing a template', () => {
    const template = 'string {{bind:entityName.attributeName}} binding'
    const input = 'string some information binding'
    const codeTree = fromTemplate(template)
    const extracted = extract(input, codeTree)
    
    expect(
      extracted.collection
        .get_entity('entityName')
        .get_bundle()
        .to_data()
    ).toEqual([{attributeName: 'some information'}])
  })

  test('We can construct strings based on a template and some data', () => {
    const template = 'string {{bind:entityName.attributeName}} binding'
    const codeTree = fromTemplate(template)
    const coll = get_collectionFromCodeTree(codeTree)
    
    coll
      .get_entity('entityName')
        .get_bundle()
        .add_record()
          .set_value('attributeName', 'some information')

    const output = construct(coll, codeTree)
    expect(output).toEqual('string some information binding')
  })

})
