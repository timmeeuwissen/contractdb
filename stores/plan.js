import { defineStore } from 'pinia'

export const usePlanStore = defineStore(
  'planStore', 
  () => {
    const 
      paidPlan = ref(false),
      query = ref(false),
      databaseManagement = ref(false),
      auditTrail = ref(false),
      config = ref(false),
      migrations = ref(false),
      graphs = ref(false),
      translations = ref(false),
      access = ref(false),
      APIs = ref(false)
    
    return {
      paidPlan,
      query,
      databaseManagement,
      auditTrail,
      config,
      migrations,
      graphs,
      translations,
      access,
      APIs
    }
  },
  { persist: true }
)
