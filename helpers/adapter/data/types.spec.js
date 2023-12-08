import { describe, test, expect, beforeEach } from 'vitest'
import { types, infer, inferanceType } from './types'
import { DateTime } from 'luxon'

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
  test('can convert from string', () => expect(types.date.to(example)).toEqual(DateTime.local(2023,12,6)))
  test('can convert to string', () => expect(types.date.from(DateTime.local(2023,12,6,12,1,2))).toStrictEqual(example))
  test('what goes in, comes out', () => {
    expect(types.date.from(types.date.to(example))).toStrictEqual(example)
  })
})

describe('a datetime', async () => {
  const example = '2023-12-06 12:01:02'
  test('can be detected positively', () => expect(types.datetime.test(example)).toBeTruthy())
  test('can be detected negatively', () => expect(types.datetime.test('notadate')).toBeFalsy())
  test('can convert from string', () => expect(types.datetime.to(example)).toEqual(DateTime.local(2023,12,6,12,1,2)))
  test('can convert to string', () => expect(types.datetime.from(DateTime.local(2023,12,6,12,1,2))).toStrictEqual(example))
  test('what goes in, comes out', () => {
    expect(types.datetime.from(types.datetime.to(example))).toStrictEqual(example)
  })
})

describe('a string', async () => {
  test('can convert into a string representation', () => expect(types.string.to('"some\\"string"')).toStrictEqual('some"string'))
  test('remains the samen when asked to be a string', () => expect(types.string.from('some"string')).toStrictEqual('"some\\"string"'))
})

describe('a boolean', async () => {
  test('can be detected positively', () => expect(types.boolean.test('false')).toBeTruthy())
  test('can be detected from bit', () => expect(types.boolean.test('0')).toBeTruthy())
  test('can be detected negatively', () => expect(types.boolean.test('notabool')).toBeFalsy())
  test('can convert from string', () => expect(types.boolean.to('false')).toStrictEqual(false))
  test('can convert to string', () => expect(types.boolean.from(false)).toStrictEqual('false'))
})

describe('type inferance', () => {
  test('can be asked what it would be', () => expect(inferanceType('false').type).toStrictEqual('boolean'))
  test('can be asked to auto-infer', () => expect(infer('-1.2')).toStrictEqual(-1.2))
  
  const uniqueTest = [{type: 'unique', test: val => val == 'uniqueTest'}]
  test(
    'can be asked to auto-infer', 
    () => expect(
      inferanceType(
        'uniqueTest', 
        uniqueTest
      ).type
    ).toStrictEqual(uniqueTest[0].type))
})