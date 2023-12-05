import { describe, test, expect, beforeEach } from 'vitest'
import { from, to } from './string'

describe('a string', async () => {

  test('when nothing interprets, nothing changes', () => {
    const {collection, codeTree} = from('someString')
    expect(
      to(collection, codeTree)
    ).toEqual('someString')
  })
})
