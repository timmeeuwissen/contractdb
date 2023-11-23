import { defineStore } from 'pinia'

export const useRecordsStore = defineStore('recordsStore', {
  state: () => ({
    records: {},
    deltas: {},
    definitions: {},
    relatingRecords: {}
  }),
  actions: {
    async fetchRecord(table, id) {
      const response = await useFetch(`/api/table/${table}/${id}`)
      if (!(table in this.records)) {
        this.records[table] = {}
      }
      if (!(table in this.definitions)) {
        this.definitions[table] = response.data.value.definitions
      }
      if (!(table in this.records)) {
        this.relatingRecords[table] = {}
      }
      if (!(table in this.relatingRecords)) {
        this.relatingRecords[table][response.data.value.record[response.data.value.primaryKey]] = response.data.value.relatingRecords
      }
      this.records[table][response.data.value.record[response.data.value.primaryKey]] =  
        response.data.value.record
    },
    async fetchDelta(table, id, formData) {
      if (!(table in this.deltas)) this.deltas[table] = {}
      const response = await useFetch(
        `/api/table/${table}/${id}?mode=delta`,
        { 
          method: 'PUT',
          body: formData,
        }
      )
      this.deltas[table][id] = response.data.value
    }
  },
  getters: {
    record: state => {
      return (table, id) => {
        if (state.records[table] && state.records[table][id]) {
          return state.records[table][id]
        }
        return undefined
      }
    },
    delta: state => {
      return (table, id) => {
        if (state.deltas[table] && state.deltas[table][id]) {
          return state.deltas[table][id]
        }
        return undefined
      }
    },
    definition: state => {
      return (table) => {
        if (state.definitions[table]) {
          return state.definitions[table]
        }
        return undefined
      }
    },
    referencedBy: state => {
      return (table, id) => {
        if (state.relatingRecords[table][id]) {
          return state.relatingRecords[table][id]
        }
        return undefined
      }
    }
  }
})
