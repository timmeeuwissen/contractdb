<template lang="pug">
//- list all databases that are allowed to be showed here
v-col(cols="auto")
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

v-col.d-flex.align-center.flex-column.mt-4
  slot
</template>
<script setup>
import { useTablesStore } from '~/stores/tables'
import { useDebugStore } from '~/stores/debug'

const debugStore = useDebugStore()
const tablesStore = useTablesStore()

tablesStore.fetchTables()

</script>