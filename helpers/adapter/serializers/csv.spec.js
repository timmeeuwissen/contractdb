import { describe, test, expect, beforeEach, vi } from 'vitest'
import * as headers from './csv.spec.headers'
import * as columns from './csv.spec.columns'
import { o_instruction } from '../code/operations/instruction'
import { fromTemplate } from './csv'

const matchToTemplates = tpl => () => {
  const codeTree = fromTemplate(tpl.str)
  const fn = vi.fn()
  codeTree.traverse(fn)
  
  const expectancy = tpl.exp
  const callMatch = fn.mock.calls.map(([ctx, instr, args]) => ([ctx.chain.length, instr, args]))
  expect(callMatch).toEqual(expectancy)
}

describe('a csv', async () => {

  describe('to understand a template', () => {

    describe('header logic', () => {
      test(
        'when a schema is given, we interpret its headers as instructions', 
        matchToTemplates(headers.basicHeader)
      )
    
      test(
        'single line comments go as children under their instructions', 
        matchToTemplates(headers.headerWithComment)
      )

      test(
        'single line comments can also root nodes', 
        matchToTemplates(headers.singleLineComment)
      )

      test(
        'multi line comments go as children under their instructions', 
        matchToTemplates(headers.headerWithMultilineComment)
      )

      test(
        'multi line comments can also come as root nodes', 
        matchToTemplates(headers.multilineComment)
      )
    })

    describe('column logic', () => {
      test(
        'can start a basic binding',
        matchToTemplates(columns.basicBinding)
      )

      test(
        'can remap to a custom binding',
        matchToTemplates(columns.customBinding)
      )
    })
  })
})