import { defineStore } from 'pinia'

export const useTablesStore = defineStore('tablesStore', {
  state: () => ({
    tables: [],
    views: [],
    procedures: [],
  }),
  actions: {
    async fetchTables() {
      const response = await useFetch('/api/queryables')
      this.tables = response.data.value.tables
      this.views = response.data.value.views
      this.procedures = response.data.value.procedures
    }
  },  
})
