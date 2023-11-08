import { defineStore } from 'pinia'

export const useDebugStore = defineStore('debugStore', {
  state: () => ({
    active: false,
  }),
})