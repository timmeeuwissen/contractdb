import { describe, test, expect, beforeEach, vi } from 'vitest'
import { tree } from './tree'

describe('a code-tree', () => {
  let ct = tree()
  const op = (ctx) => {

  }

  beforeEach(() => {
    ct = tree()
  })
  
  test('can traverse over an added operation', () => {
    const fn = vi.fn()
    ct.add_operation(op).traverse(fn)
    expect(fn).toHaveBeenCalledOnce()
  })

  test('can chain multiple operations', () => {
    const fn = vi.fn()
    ct.add_operation(op).add_operation(op).traverse(fn)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  describe('can handle depth', () => {
    test('can get deeper', () => {
      const fn = vi.fn()
      ct.add_operation(op).stepIn().add_operation(op).root().traverse(fn)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn.mock.lastCall[0].chain).toEqual([op])
      expect(fn.mock.lastCall[1]).toEqual(op)
    })  

    test('can get higher again', () => {
      const fn = vi.fn()
      ct
        .add_operation(op)
        .stepIn()
        .add_operation(op)
        .stepOut()
        .add_operation(op)
        .root()
        .traverse(fn)
      expect(fn).toHaveBeenCalledTimes(3)
      expect(fn.mock.lastCall[0].chain).toEqual([])
      expect(fn.mock.lastCall[1]).toEqual(op)
    })  

    test('callbacks can step out', () => {
      let cnt = 0
      const fn = vi.fn((ctx, op) => {
        cnt += 1
        if (cnt == 2) {
          ctx.stepOut()
        }
      })
      ct
        .add_operation(op)
        .stepIn()
        .add_operation(op)
        .add_operation(op) // this one is skipped by the callback
        .root()
        .traverse(fn)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn.mock.lastCall[0].chain).toEqual([op])
      expect(fn.mock.lastCall[1]).toEqual(op)
    })  

    test('callbacks can prevent stepping in', () => {
      let cnt = 0
      const fn = vi.fn((ctx, op) => {
        cnt += 1
        if (cnt == 2) {
          ctx.preventStepIn()
        }
      })
      ct
        .add_operation(op)
        .stepIn()
        .add_operation(op)
        .stepIn()
        .add_operation(op) // this one is skipped by the callback
        .root()
        .traverse(fn)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn.mock.lastCall[0].chain).toEqual([op])
      expect(fn.mock.lastCall[1]).toEqual(op)
    })  


  })
})