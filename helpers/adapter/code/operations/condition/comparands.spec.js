import { describe, test, expect } from 'vitest'
import { comparand_path, comparands, determineComparandType } from './comparands'

describe('a path comparand', () => {
  test('responds like a type', () => {
    expect(comparand_path().type).toEqual('path')
  })
  test('matches [collection], entity and attribute', () => {
    expect(comparand_path().test('a.b.c')).toBeTruthy()
    expect(comparand_path().test('b.c')).toBeTruthy()
    expect(comparand_path().test('c')).toBeFalsy()
  })
  
  test('returns path information about collection, entity and attribute', () => {
    expect(comparand_path().to('a.b.c')).toMatchObject({
      collection: 'a',
      entity: 'b',
      attribute: 'c',
    })
  })

  test('returns path information about entity and attribute', () => {
    expect(comparand_path().to('b.c')).toMatchObject({
      entity: 'b',
      attribute: 'c',
    })
  })
})

describe('comparands', () => {
  test('are responding with a type', () => {
    expect(determineComparandType('9').type).toEqual('integer')
  })
})

describe('path comparand will be selected before any other', () => {
  test('a resonable path, is found as a path', () => {
    expect(determineComparandType('some.path', [comparand_path()]).type).toEqual('path')
  })
})
