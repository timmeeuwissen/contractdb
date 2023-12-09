import { describe, test, expect, beforeEach, vi } from 'vitest'
import { from, to } from './string'
import { o_instruction } from '../code/operations/instruction'
import { o_bind } from '../code/operations/bind'

describe('a string', async () => {

  test('when nothing interprets, non-interpretations are consumed as instructions', () => {
    const codeTree = from('someString')
    const fn = vi.fn()
    codeTree.traverse(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn.mock.lastCall[0].chain).toEqual([])
    expect(fn.mock.lastCall[1]).toEqual(o_instruction)
})

  test('when there is a binding, it is amended to the collection', () => {
    const codeTree = from('string {{bind:entityName.attributeName}} binding')
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
    const codeTree = from(template)
    const reconstructed = to(codeTree)
    expect(reconstructed).toEqual(template)
  })
})
