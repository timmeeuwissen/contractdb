import { describe, test, expect, beforeEach } from 'vitest'
import { types } from './types'

describe('an integer', async () => {
  test('can be detected positively', () => expect(types.integer.test('9')).toBeTruthy())
  test('can be detected signed', () => expect(types.integer.test('-9')).toBeTruthy())
  test('can be detected negatively', () => expect(types.integer.test('nine')).toBeFalsy())
  test('can convert from string', () => expect(types.integer.to('9')).toStrictEqual(9))
  test('can convert to string', () => expect(types.integer.from(9)).toStrictEqual('9'))
})

describe('a float', async () => {
  test('can be detected positively', () => expect(types.float.test('9.1')).toBeTruthy())
  test('can be detected signed', () => expect(types.float.test('-9.1')).toBeTruthy())
  test('can be detected negatively', () => expect(types.float.test('ninepointone')).toBeFalsy())
  test('can convert from string', () => expect(types.float.to('9.1')).toStrictEqual(9.1))
  test('can convert to string', () => expect(types.float.from(9.1)).toStrictEqual('9.1'))
})

describe('a date', async () => {
  const example = '2023-12-06'
  test('can be detected positively', () => expect(types.date.test(example)).toBeTruthy())
  test('can be detected negatively', () => expect(types.date.test('notadate')).toBeFalsy())
  test('can convert from string', () => expect(types.date.to(example).toDateString()).toStrictEqual(new Date(2023,11,6,1,1,1).toDateString()))
  test('can convert to string', () => expect(types.date.from(new Date(2023,11,6,1,1,1))).toStrictEqual(example))
  test('what goes in, comes out', () => {
    expect(types.date.from(types.date.to(example))).toStrictEqual(example)
  })
})

describe('a datetime', async () => {
  const example = '2023-12-06 12:01:02'
  test('can be detected positively', () => expect(types.datetime.test(example)).toBeTruthy())
  test('can be detected negatively', () => expect(types.datetime.test('notadate')).toBeFalsy())
  test('can convert from string', () => expect(types.datetime.to(example).toDateString()).toStrictEqual(new Date(2023,11,6,12,1,2).toDateString()))
  test('can convert to string', () => expect(types.datetime.from(new Date(2023,11,6,12,1,2))).toStrictEqual(example))
  test('what goes in, comes out', () => {
    expect(types.datetime.from(types.datetime.to(example))).toStrictEqual(example)
  })
})

describe('a string', async () => {
  test('can be detected positively', () => expect(types.string.test('9.1')).toBeTruthy())
  test('can be detected signed', () => expect(types.string.test('-9.1')).toBeTruthy())
  test('can be detected negatively', () => expect(types.string.test('ninepointone')).toBeFalsy())
  test('can convert from string', () => expect(types.string.to('9.1')).toStrictEqual(9.1))
  test('can convert to string', () => expect(types.string.from(9.1)).toStrictEqual('9.1'))
})

describe('a boolean', async () => {
  test('can be detected positively', () => expect(types.boolean.test('false')).toBeTruthy())
  test('can be detected from bit', () => expect(types.boolean.test('0')).toBeTruthy())
  test('can be detected negatively', () => expect(types.boolean.test('notabool')).toBeFalsy())
  test('can convert from string', () => expect(types.boolean.to('false')).toStrictEqual(false))
  test('can convert to string', () => expect(types.boolean.from(false)).toStrictEqual('false'))
})
