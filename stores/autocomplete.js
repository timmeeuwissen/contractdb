import { defineStore } from 'pinia'

export const useAutocompleteStore = defineStore('autocompleteStore', {
  state: () => ({
    perTable: {}
  }),
  actions: {
    async fetchCompleterData(table) {
      const response = await useFetch(
        `/api/table/${table}/autocomplete`,
        { server: true }
      )
      this.perTable = { ...this.perTable, ...response.data.value }
    }
  },
  getters: {
    completerData: state => {
      return (table) => {
        if (state.perTable[table]) {
          return state.perTable[table]
        }
        return undefined
      }
    }
  }
})
