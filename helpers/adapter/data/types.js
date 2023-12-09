import { DateTime } from 'luxon'

export const types = {
  'integer': {
    to: val => parseInt(val, 10),
    from: val => val.toString(),
    test: val => val.match(/^\-?\d+$/),
  },
  'float': {
    to: val => parseFloat(val),
    from: val => val.toString(),
    test: val => val.match(/^\-?\d+\.\d+$/)
  },
  'date': {
    to: val => {
      const matches = types.date.test(val).groups
      return DateTime.local(
        parseInt(matches.year),
        parseInt(matches.month),
        parseInt(matches.day)
      )
    },
    from: val => val.toFormat('yyyy-MM-dd'),
    test: val => val
      .match(/^(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2})$/)
  },
  'datetime': {
    to: val => {
      const matches = types.datetime.test(val).groups
      return DateTime.local(
        parseInt(matches.year), 
        parseInt(matches.month), 
        parseInt(matches.day),
        parseInt(matches.hour),
        parseInt(matches.minute),
        parseInt(matches.second)
      )
    },
    from: val => val.toFormat('yyyy-MM-dd HH:mm:ss'),
    test: val => val
      .match(/^(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2})\s(?<hour>\d{2})\:(?<minute>\d{2})\:(?<second>\d{2})$/)
  },
  'string': {
    to: val => {
      const matches = types.string.test(val).groups
      return matches.str.replace(/\\"/g,'"')
    },
    from: val => `"${val.replace(/"/g,'\\\"')}"`,
    test: val => val.match(/^"(?<str>.*)"$/)
  },
  // 'stringTemplate': {
  //   to: val => {
  //     const matches = types.stringTemplate.test.groups
  //     return matches.template.replace(/\\`/g,'`')
  //   },
  //   from: val => `\`${val.replace(/`/g,'\\`')}\``,
  //   test: val => val.match(/^`(?<template>.*)`$/)
  // },
  'boolean': {
    to: val => val == 'false' || !val ? false : true,
    from: val => val.toString(),
    test: val => val.match(/^true|false|1|0$/)
  },
  'passthrough': {
    to: val => val,
    from: val => val,
    test: () => false
  }
}

export const typeArray = Object
  .entries(types)
  .reduce(
    (acc, [type, methods]) => ([...acc, {...methods, type}]),
    []
  )

export const inferanceType = (val, inferanceTypes = typeArray) => 
  inferanceTypes
    .find(o => o.test(val))

export const infer = val => {
  const type = inferanceType(val)
  if (type) return type.to(val)
  return val
}