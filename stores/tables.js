import { defineStore } from 'pinia'

export const useTablesStore = defineStore('tablesStore', {
  state: () => ({
    tables: [],
  }),
  actions: {
    async fetchTables() {
      const response = await useFetch('/api/tables')
      this.tables = response.data.value
    }
  },  
})
