import { defineStore } from 'pinia'

export const useRecordsStore = defineStore('recordsStore', {
  state: () => ({
    records: {},
    definitions: {}
  }),
  actions: {
    // todo: enable fetching within another database
    // todo: check if record has changed inbetween
    // todo: link changes to overview
    async fetchRecord(table, id) {
      const response = await useFetch(`/api/table/${table}/${id}`)
      if (!(table in this.records)) {
        this.records[table] = {}
      }
      if (!(table in this.definitions)) {
        this.definitions[table] = response.data.value.definitions
      }
      this.records[table][response.data.value.record[response.data.value.primaryKey]] = 
        response.data.value.record
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
    definition: state => {
      return (table) => {
        if (state.definitions[table]) {
          return state.definitions[table]
        }
        return undefined
      }
    }
  }
})
