import { defineStore } from 'pinia'

export const useGraphsStore = defineStore('graphsStore', {
  state: () => ({
    graphs: [],
  }),
  actions: {
    async fetchGraphs() {
      const response = await useFetch(
        '/api/graphs',
        { server: true }
      )
      this.graphs = response.data.value.graphs
    }
  },  
})
