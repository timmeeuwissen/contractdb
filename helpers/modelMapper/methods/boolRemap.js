export const forward = (value, args) => {
  if('valuesToTrue' in args && value in args.valuesToTrue) return true
  if('valuesToFalse' in args && value in args.valuesToTrue) return false
  if('default' in args) return args.default
  return null
}