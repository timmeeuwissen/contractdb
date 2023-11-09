import { defineStore } from 'pinia'

export const useAutocompleteStore = defineStore('autocompleteStore', {
  state: () => ({
    perTable: {}
  }),
  actions: {
    async fetchCompleterData(table) {
      const response = await useFetch(`/api/table/${table}/autocomplete`)
      this.perTable = { ...this.perTable, ...response.data.value }
      console.log(this.perTable)
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
