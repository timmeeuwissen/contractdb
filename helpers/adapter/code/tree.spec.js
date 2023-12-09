import { describe, test, expect, beforeEach, vi } from 'vitest'
import { tree, treeInstructions } from './tree'

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

  describe('an operator can steer the tree', () => {
    test('can step in (like: o_if)', () => {
      const fn = vi.fn()
      ct.add_operation([op, [treeInstructions.TREE_STEP_IN]])
        .add_operation(op)
        .root().traverse(fn)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn.mock.lastCall[0].chain).toEqual([op])
      expect(fn.mock.lastCall[1]).toEqual(op)
    })  

    test('can step out (like: o_endIf)', () => {
      const fn = vi.fn()
      ct.add_operation(op)
        .stepIn()
        .add_operation(op)
        .add_operation([op, [treeInstructions.TREE_STEP_OUT]])
        .root().traverse(fn)
      expect(fn).toHaveBeenCalledTimes(3)
      expect(fn.mock.lastCall[0].chain).toEqual([])
      expect(fn.mock.lastCall[1]).toEqual(op)
    })  

    test('can step in again (like: o_else)', () => {
      const fn = vi.fn()
      ct.add_operation(op)
        .stepIn()
        .add_operation([op, [treeInstructions.TREE_STEP_IN]])
          .add_operation(op)
        .add_operation([op, [treeInstructions.TREE_STEP_OUT, treeInstructions.TREE_STEP_IN]])
          .add_operation(op)
        .root().traverse(fn)
      expect(fn).toHaveBeenCalledTimes(5)
      expect(fn.mock.lastCall[0].chain).toEqual([op, op])
      expect(fn.mock.lastCall[1]).toEqual(op)
    })  
  })

  test('callbacks can look around', () => {
    let cnt = 0

    const faux_op = () => {};
    const fn = vi.fn((ctx, op, opArgs) => {
      cnt += 1
      if (cnt == 2) {
        expect(opArgs).toEqual(['faux_if'])
        expect(ctx.lookAround.next().operationArguments).toEqual(['faux_else'])
        expect(ctx.lookAround.findNext(faux_op).operationArguments[0]).toEqual('faux_op2')
      }
    })


    ct.add_operation(faux_op,['faux_op1'])
      .add_operation([op, [treeInstructions.TREE_STEP_IN]], ['faux_if'])
        .add_operation(op, ['faux_if_body'])
      .add_operation([op, [treeInstructions.TREE_STEP_OUT, treeInstructions.TREE_STEP_IN]], ['faux_else'])
        .add_operation(op, ['faux_else_body'])
      .add_operation([op, [treeInstructions.TREE_STEP_OUT]], ['faux_endif'])
      .add_operation(faux_op, ['faux_op2'])
      .root()
      .traverse(fn)
  })

})