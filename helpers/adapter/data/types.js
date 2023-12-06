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
      const localOffset = (new Date(Date.now())).getTimezoneOffset()
      return new Date(
        parseInt(matches.year), 
        parseInt(matches.month)-1, 
        parseInt(matches.day),
        1,
        1 + (localOffset * -1),
        1
      )
    },
    from: val => val.toISOString().split(/[T\.]/g)[0],
    test: val => val
      .match(/^(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2})$/)
  },
  'datetime': {
    to: val => {
      const matches = types.datetime.test(val).groups
      const localOffset = (new Date(Date.now())).getTimezoneOffset()
      return new Date(
        parseInt(matches.year), 
        parseInt(matches.month)-1, 
        parseInt(matches.day),
        parseInt(matches.hour),
        parseInt(matches.minute) + (localOffset * -1),
        parseInt(matches.second)
      )
    },
    from: val => val.toISOString().split(/[T\.]/g).slice(0,2).join(' '),
    test: val => val
      .match(/^(?<year>\d{4})\-(?<month>\d{2})\-(?<day>\d{2})\s(?<hour>\d{2})\:(?<minute>\d{2})\:(?<second>\d{2})$/)
  },
  'string': {
    to: val => val.toString(),
    from: val => val,
  },
  'boolean': {
    to: val => val == 'false' || !val ? false : true,
    from: val => val.toString(),
    test: val => val.match(/^true|false|1|0$/)
  }
}
