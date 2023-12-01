import { defineStore } from 'pinia'

export const useQueryablesStore = defineStore(
  'queryablesStore', 
  () => {
    const 
      tables = ref([]),
      views = ref([]),
      procedures = ref([]),
      schema = ref({})
    
    const fetchTables = async () => {
      const response = await useFetch(
        '/api/queryables',
        { server: true }
      )
      tables.value = response.data.value.tables
      views.value = response.data.value.views
      procedures.value = response.data.value.procedures
      schema.value = response.data.value.schema
    }

    const tableObject = computed(() => {
      tables.value.reduce(
        (acc, table) => ({...acc, [table.tableName]: table}), 
        {}
      )
    })

    return {
      fetchTables,
      tableObject,
      tables,
      views,
      procedures,
      schema,
    }
  }
)
