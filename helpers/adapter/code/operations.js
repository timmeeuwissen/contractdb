export const o_instruction = (ctx, str) => ({
  get: () => str,
  eval: () => true,
})

export const o_condition = (ctx, str, entity, attribute) => ({
  get: () => str,
  eval: () => true,
})
export const o_if = o_condition

export const o_forEach = (ctx, str, entity, attribute) => ({
  get: () => str,
  eval: () => true,
})