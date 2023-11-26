const detailWindowPosition = () => ({
  prefixMatch: 'D',
  matched: ([windowPosition, fieldPosition], name, allResults = {}) => {
    if (!(windowPosition in allResults)) allResults[windowPosition] = []
    allResults[windowPosition].push({pos: fieldPosition || '_end', name})
    return allResults
  },
  unmatched: (name, allResults = {}) => {
    if (!('_end' in allResults)) allResults['_end'] = []
    allResults['_end'].push({pos: '_end', name})
    return allResults
  },
  postProcess: (_allFields, allResults) => {
    Object.keys(allResults).forEach(k => {
      allResults[k].sort((a,b) => 
        (a.pos == '_end') 
          ? 1 
          : (a.pos < b.pos || b.pos == '_end' ? -1 : 0)
      )
    })
    return allResults
  }
})

export default {
  detailWindowPosition
}