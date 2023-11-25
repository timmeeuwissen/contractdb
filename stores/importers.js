import { defineStore } from 'pinia'

export const useImportersStore = defineStore('importersStore', {
  state: () => ({
    importers: [],
  }),
  actions: {
    async fetchImporters() {
      const { data } = await useFetch(
        '/api/imports',
        { server: true }
      )
      this.importers = Object.keys(data.value).reduce((
        (acc, key) => [...acc, {title: key, value: key, type: data.value[key].type}]), 
        []
      )
    }
  },
})
