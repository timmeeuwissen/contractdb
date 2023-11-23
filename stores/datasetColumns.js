import { defineStore } from 'pinia'
import { getDatasetStore } from './dataset'

// todo : allow for more than tables
export const getDatasetColumnsStore = (queryable) => (defineStore(
  `datasetColumnsStore_${queryable}`, 
  () => {
    const datasetStore = getDatasetStore(queryable)

    const checked = ref([])
    const sorted = ref([])
    const headers = ref([])
    const hideableHeaders = ref({})

    const headersToShow = computed(() => {
      const 
        checkedObj = checked.value.reduce((acc, col) => ({...acc, [col]: true}), {}),
        sortedObj = Object.entries(sorted.value).reduce((acc, [k,v]) => ({...acc, [v]: k}), {})
  
      return headers.value.reduce(
        (acc, header) => 
          (header.title in sortedObj)
          && !(header.title in checkedObj)
          ? acc
          : [...acc, header], 
        []
      )
    })

    watch(
      datasetStore.headers,
      (newHeaders) => {
        checked.value = newHeaders.map(header => header.title)
        sorted.value = newHeaders.map(header => header.title)
        hideableHeaders.value = newHeaders.reduce((acc, header) => ({...acc, [header.title]: header.hideable}), {})
        headers.value = newHeaders
      },
      { immediate: true }
    )

    return {
      headers,
      sorted,
      checked,
      headersToShow,
      hideableHeaders,
    }
  },
  { persist: true }
))()
