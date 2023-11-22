import { defineStore } from 'pinia'

export const useQueryablesStore = defineStore('queryablesStore', {
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
  getters: {
    tableObject: state => state.tables.reduce(
      (acc, table) => ({...acc, [table.tableName]: table}), 
      {}
    )
  }  
})
