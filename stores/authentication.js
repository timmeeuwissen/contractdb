import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore(
  'autocompleteStore',
  () => {

    const address = ref('')
    const username = ref('')
    const database = ref('')
    const databases = ref([])
    const token = ref('')

    const login = async password => {
      const loginResult = await useFetch(
        '/api/login', 
        {
          method: 'post',
          server: true,
          body: {
            address,
            username,
            database,
            password,
          }
        }
      )

      console.log('Login Result: ', loginResult)
    }

    return {
      login,
      address,
      username,
      database,
      databases,
      token,
    }
  },
  {
    persist: {
      storage: 'cookies'
    },  
  }
)