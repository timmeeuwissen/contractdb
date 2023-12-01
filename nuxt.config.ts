import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  runtimeConfig: {
    jwtSecret: '' // can be overridden as env var
  },
  pages: true,
  css: [
    '@mdi/font/css/materialdesignicons.min.css',
    'vuetify/lib/styles/main.sass',
    'codemirror/addon/hint/show-hint.css',
    'codemirror/lib/codemirror.css'
  ],
  build: {
    transpile: ['vuetify'],
  },
  i18n: {
    vueI18n: './i18n.config.js' 
  },
  modules: [
    '@pinia/nuxt', 
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/device',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  piniaPersistedstate: {
    cookieOptions: {
      sameSite: 'strict',
    },
    storage: 'localStorage'
  },  
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})