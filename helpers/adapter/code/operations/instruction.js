export const o_instruction = (_ctx, str) => ({
  get: () => str,
  eval: () => true,
  parse: () => str,
  implicit: true,
})