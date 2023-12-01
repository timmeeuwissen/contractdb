import { defineStore } from 'pinia'

export const useQueryStore = defineStore(
  'queryStore', 
  () => {
    const 
      history = ref([]),
      lastResult = ref(null)
  
    const runQuery = (query) => {
      const newResult = {
        query,
        status: 'pending',
        info: ''
      }
      const queryResult = useFetch(
        '/api/query',
        { 
          method: 'POST',
          server: true,
          body: query,
        }
      )
      history.value.push(newResult)
      
      queryResult
        .then(({ data }) => {
          // todo : interpret the status and replace it in newResult
          newResult.status = data.status || 'failed'
          newResult.info = data.infoString
          lastResult.value = data.value
        })
        .catch(err => {
          newResult.status = 'failed'
          newResult.info = err
        })
    }

    return {
      runQuery,
      history,
      lastResult,
    }
  },
  { persist: true }
)
