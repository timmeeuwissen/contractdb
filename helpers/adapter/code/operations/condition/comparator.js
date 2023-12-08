export const comp_basic = (() => {  
  
  const comparators = {
    '=':  (a,b) => a == b,
    '>':  (a,b) => a > b,
    '>=': (a,b) => a >= b,
    '<':  (a,b) => a < b,
    '<=': (a,b) => a <= b,
    '!=': (a,b) => a != b,
  }

  const matchRegex = new RegExp(
    `/^\s?(${
      Object
        .keys(comparators)
        .map(str => str.replace(/[\.\*\+\?\^\$\{\}\(\)\|\[\]\\]/g, '\\$&'))
        .join('|')
      })\s?$/`
  )

  return { comparators, matchRegex }

})()