<template lang="pug">
v-card(
  prepend-icon="mdi-table"
  title="Datasets"
)
  v-card-text
    v-table
      tbody
        tr(v-for="table in tablesStore.tables.filter(table => table.inListing)")
          td 
            NuxtLink(:to="`/table/${table.tableName}`") {{ table.tableName }}
</template>
<script setup>
import { useTablesStore } from '~/stores/tables'
const tablesStore = useTablesStore()

tablesStore.fetchTables()
</script>