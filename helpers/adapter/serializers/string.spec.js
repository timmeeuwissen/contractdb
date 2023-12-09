import { describe, test, expect, beforeEach, vi } from 'vitest'
import { fromTemplate, toTemplate } from './string'
import { o_instruction } from '../code/operations/instruction'
import { o_bind } from '../code/operations/bind'

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
    const reconstructed = toTemplate(codeTree)
    expect(reconstructed).toEqual(template)
  })

  test('We can extract data from the template providing a template', () => {
    const template = 'string {{bind:entityName.attributeName}} binding'
    const input = 'string some information binding'
    const codeTree = fromTemplate(template)
    const extracted = extract(input, codeTree)
    expect(extracted.collection.get_entity('entityName').get_attribute('attributeName')).toEqual('some information')
  })


})
