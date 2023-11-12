import { defineStore } from 'pinia'

export const useDebugDefinitionStore = defineStore('debugDefinitionsStore', {
  state: () => ({
    perTable: {}
  }),
  actions: {
    async fetchTableData(table) {
      const response = await useFetch(`/api/table/${table}/definition`)
      this.perTable = { ...this.perTable, ...response.data.value }
    }
  },
  getters: {
    tableData: state => {
      return (table) => {
        if (state.perTable[table]) {
          return state.perTable[table]
        }
        return undefined
      }
    }
  }
})