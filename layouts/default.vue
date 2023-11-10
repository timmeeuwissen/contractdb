<template lang="pug">
//- list all databases that are allowed to be showed here
v-container
  v-row.flex-nowrap
    v-col(cols="2")
      v-row
        v-btn(
          icon="mdi-home-outline"
          to="/"
        )
        v-spacer
        v-switch(
          v-model="debugStore.active"
          color="primary"
          label="Debugging"
        )
        v-select(
          label="Language",
          v-model="locale"
          :items="locales"
        )
      v-card
        v-card-title Menu
        v-card-text
          v-table
            thead
              tr
                th Datasets
            tbody
              tr(v-for="table in tablesStore.tables.filter(table => table.inListing)")
                td 
                  NuxtLink(:to="`/table/${table.tableName}`") {{ table.tableName }}

    v-col(cols="10").justify.pt-15
      slot
</template>
<script setup>
import { useTablesStore } from '~/stores/tables'
import { useDebugStore } from '~/stores/debug'
const { locale, locales } = useI18n()

const debugStore = useDebugStore()
const tablesStore = useTablesStore()

tablesStore.fetchTables()

</script>