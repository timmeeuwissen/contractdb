import { defineStore } from 'pinia'

export const debugDefinitionStore = defineStore(
  'definitionsStore', 
  {
    state: () => ({
      perTable: {}
    }),
    actions: {
      async fetchTableData(table) {
        const response = await useFetch(
          `/api/table/${table}/definition`,
          { server: true }
        )
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
  },
  {
    persist: true
  }
)