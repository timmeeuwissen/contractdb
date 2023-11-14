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
      v-list-item(to="/debug/database" v-if="debugStore.active")
        template(v-slot:prepend)
          v-icon(icon="mdi-database" color="warning")
        v-list-item-title  Database
        v-list-item-subtitle See the database from wich everything you see is derived
      v-list-item(to="/debug/config" v-if="debugStore.active")
        template(v-slot:prepend)
          v-icon(icon="mdi-code-json" color="warning")
        v-list-item-title Configuration
        v-list-item-subtitle Check the configuration which generates everything you see
      v-list-item(to="/debug/language" v-if="debugStore.active")
        template(v-slot:prepend)
          v-icon(icon="mdi-translate" color="warning")
        v-list-item-title Translations
        v-list-item-subtitle Check translations of everything you see
      v-list-item(to="/access" v-if="debugStore.active")
        template(v-slot:prepend)
          v-icon(icon="mdi-security" color="warning")
        v-list-item-title Access
        v-list-item-subtitle Manage who can see what
</template>
<script setup>
import { useDebugStore } from '~/stores/debug'
const debugStore = useDebugStore()
</script>