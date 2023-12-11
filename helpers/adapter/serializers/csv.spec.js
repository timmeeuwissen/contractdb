
const header = 
`version 1.2
@separator ';'
@quoted
@permitEmpty
@totalColumns 20
`
describe('a csv', async () => {

  test('when a schema is given, we interpret its headers as instructions', () => {
    const codeTree = fromTemplate(header)
    const fn = vi.fn()
    codeTree.traverse(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn.mock.lastCall[0].chain).toEqual([])
    expect(fn.mock.lastCall[1]).toEqual(o_instruction)
  })
})