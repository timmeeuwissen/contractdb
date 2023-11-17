<template lang="pug">
v-card
  v-card-title What to do
  v-card-text 
    v-list(lines="one")
      v-list-item(to="/migrate")
        template(v-slot:prepend)
          v-icon(icon="mdi-database-import-outline")
        v-list-item-title Migration wizard
        v-list-item-subtitle Import and export data to and from your database
v-card(color="warning" v-if="debugStore.active")
  v-card-title Config stuff
  v-card-text 
    v-list(lines="one" color="warning")
      v-list-item(to="/debug/database")
        template(v-slot:prepend)
          v-icon(icon="mdi-database")
        v-list-item-title  Database
        v-list-item-subtitle See the database from wich everything you see is derived
      v-list-item(to="/debug/config")
        template(v-slot:prepend)
          v-icon(icon="mdi-code-json")
        v-list-item-title Configuration
        v-list-item-subtitle Check the configuration which generates everything you see
      v-list-item(to="/debug/language")
        template(v-slot:prepend)
          v-icon(icon="mdi-translate")
        v-list-item-title Translations
        v-list-item-subtitle Check translations of everything you see
      v-list-item(to="/access")
        template(v-slot:prepend)
          v-icon(icon="mdi-security")
        v-list-item-title Access
        v-list-item-subtitle Manage who can see what
      v-list-item(to="/api")
        template(v-slot:prepend)
          v-icon(icon="mdi-api")
        v-list-item-title API Access
        v-list-item-subtitle Manage what systemscan do with your data
</template>
<script setup>
import { useDebugStore } from '~/stores/debug'
const debugStore = useDebugStore()
</script>