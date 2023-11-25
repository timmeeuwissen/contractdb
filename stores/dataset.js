import { defineStore } from 'pinia'

export const getDatasetStore = (queryable) => (defineStore(
  `datasetStore_${queryable}`, 
  () => {
    const headers = ref([]) 
    const records = ref([])
    const tableConfiguration = ref({})
    const foreignKeys = ref({})
    const identifiedPerTable = ref({})
    const identifiedPerField = ref({})
    const dataReady = ref(false)
    
    const fetch_data = async () => {
      const { data } = await useFetch(
        `/api/table/${queryable}`,
        { server: true }
      )
      headers.value = data.value.headers
      records.value = data.value.records
      tableConfiguration.value = data.value.tableConfiguration
      foreignKeys.value = data.value.foreignKeys
      identifiedPerTable.value = data.value.identifiedPerTable
      identifiedPerField.value = data.value.identifiedPerField
      dataReady.value = true
    }
    
    return {
      fetch_data,
      headers,
      records,
      tableConfiguration,
      foreignKeys,
      identifiedPerTable,
      identifiedPerField,
      dataReady,
    }
  },
  { persist: false }
)())