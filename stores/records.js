import { defineStore } from 'pinia'

export const getRecordStore = (queryable, id) => (
  defineStore(
    `recordStore_${queryable}_${id}`, 
    () => {
      const 
        record = ref({}),
        definition = ref({}),
        relatingRecords = ref({}),
        dataReady = ref(false),
        delta = ref({})

      const fetchRecord = async () => {
        const { data } = await useFetch(
          `/api/table/${queryable}/${id}`,
          { server: true }
        )
        record.value = data.value.record
        definition.value = data.value.definitions
        relatingRecords.value = data.value.relatingRecords
        dataReady.value = true
      }

      const fetchDelta = async () => {
        const { data } = await useFetch(
          `/api/table/${queryable}/${id}?mode=delta`,
          { 
            server: true,
            method: 'PUT',
            body: record.value,
          }
        )
        delta.value = data.value
      }

      watch(record, _newVal => fetchDelta())
      
      return {
        fetchRecord,
        fetchDelta,
        record,
        delta,
        definition,
        relatingRecords,
        dataReady,
      }
    },
    {
      persist: true
    }
  )()
)
