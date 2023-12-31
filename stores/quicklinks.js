import { defineStore } from 'pinia'
import { useQueryablesStore } from './queryables'

export const useQuicklinkStore = defineStore(
  'quicklinkStore', 
  () => {
    const queryables = ref({})
    const queryablesStore = useQueryablesStore()
    
    const 
      toggle_queryable = (queryable) => {
        if(!(queryable in queryables.value)) queryables.value[queryable] = true
        else queryables.value[queryable] = !queryables.value[queryable]
      },
      get_queryable_state = (queryable) => {
        return queryables.value[queryable]
      }
    
    // todo: for now only tables, also enable other queryables
    const fullQueryables = computed(() => {
      const tables = queryablesStore.tableObject
      return Object.entries(queryables.value).reduce((acc, [k]) => {
        if (!(k in tables)) return acc
        return [...acc, {
          to: `/table/${k}`,
          ...tables[k]
        }]
      }, [])
    })

    return {
      queryables,
      toggle_queryable,
      get_queryable_state,
      fullQueryables,
    }
  },
  {
    persist: true
  }
)
