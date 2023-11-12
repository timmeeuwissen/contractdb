<template lang="pug">
v-card
  v-card-title What to do
  v-card-text 
    v-list(lines="one")
      v-list-item(to="/import")
        template(v-slot:prepend)
          v-icon(icon="mdi-database-import-outline")
        v-list-item-title Migration wizard
        v-list-item-subtitle Import and export data to and from your database
      v-list-item(to="/debug/database" v-if="debugStore.active")
        template(v-slot:prepend)
          v-icon(icon="mdi-database")
        v-list-item-title  [ debug ] Database
        v-list-item-subtitle See the database from wich everything you see is derived
      v-list-item(to="/debug/config" v-if="debugStore.active")
        template(v-slot:prepend)
          v-icon(icon="mdi-code-json")
        v-list-item-title  [ debug ] Configuration
        v-list-item-subtitle Check the configuration which generates everything you see
      v-list-item(to="/debug/language" v-if="debugStore.active")
        template(v-slot:prepend)
          v-icon(icon="mdi-translate")
        v-list-item-title  [ debug ] Translations
        v-list-item-subtitle Check translations of everything you see
</template>
<script setup>
import { useDebugStore } from '~/stores/debug'
const debugStore = useDebugStore()
</script>