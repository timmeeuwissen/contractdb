<template lang="pug">
v-card
  v-card-text
    logo-component
v-card
  v-card-title What to do
  v-card-text 
    v-list(lines="one")
      v-list-item(to="/TIM/migrate")
        template(v-slot:prepend)
          v-icon(icon="mdi-database-import-outline")
        v-list-item-title Migration wizard
        v-list-item-subtitle Import and export data to and from your database
v-card(color="warning" v-if="debugStore.active")
  v-card-title Config stuff
  v-card-text 
    v-list(lines="one" bg-color="warning")
      v-list-item(to="/TIM/plan")
        template(v-slot:prepend)
          v-icon(icon="mdi-toggle-switch-off-outline")
        v-list-item-title Plan and Toggles
        v-list-item-subtitle Manage the features of T.I.M. 
      v-list-item(to="/TIM/database" v-if="planStore.databaseManagement")
        template(v-slot:prepend)
          v-icon(icon="mdi-database")
        v-list-item-title  Database
        v-list-item-subtitle See the database from wich everything you see is derived
      v-list-item(to="/TIM/query" v-if="planStore.query")
        template(v-slot:prepend)
          v-icon(icon="mdi-database-search")
        v-list-item-title  Query
        v-list-item-subtitle Run a query, and do yaw thang
      v-list-item(to="/TIM/config" v-if="planStore.config")
        template(v-slot:prepend)
          v-icon(icon="mdi-code-json")
        v-list-item-title Configuration
        v-list-item-subtitle Check the configuration which generates everything you see
      v-list-item(to="/TIM/translations" v-if="planStore.translations")
        template(v-slot:prepend)
          v-icon(icon="mdi-translate")
        v-list-item-title Translations
        v-list-item-subtitle Check translations of everything you see
      v-list-item(to="/TIM/access" v-if="planStore.access")
        template(v-slot:prepend)
          v-icon(icon="mdi-security")
        v-list-item-title Access
        v-list-item-subtitle Manage who can see what
      v-list-item(to="/TIM/api" v-if="planStore.APIs")
        template(v-slot:prepend)
          v-icon(icon="mdi-api")
        v-list-item-title API Access
        v-list-item-subtitle Manage what systemscan do with your data

v-card(v-if="queryables.length")
  v-card-title Quick links
  v-card-text 
    v-list(lines="one" color="warning")
      v-list-item(v-for="queryable in queryables" :to="`/TIM${queryable.to}`")
        template(v-slot:prepend)
          v-icon(:icon="queryable.icon")
        v-list-item-title {{ queryable.title }}

</template>
<script setup>
import { useDebugStore } from '~/stores/debug'
import LogoComponent from '~/components/logo.vue'
import { useQuicklinkStore } from '~/stores/quicklinks'
import { usePlanStore } from '~/stores/plan';

const planStore = usePlanStore()
const debugStore = useDebugStore()
const quicklinksStore = useQuicklinkStore()
const queryables = computed(() => quicklinksStore.fullQueryables)
</script>
