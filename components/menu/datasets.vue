<template lang="pug">
v-list(
  v-if="tablesStore.tables"
  density="compact"
  nav
) 
  v-list-item.bg-primary(
    variant="tonal"
    title="Datasets"
    subtitle="Browse through your data"
    prepend-icon="mdi-table"
  )
  v-list-item(
    v-for="table in tablesStore.tables.filter(table => table.inListing && (!props.rail || (props.rail && table.icon)))"
    :to="`/table/${table.tableName}`"
    :prepend-icon="table.icon"
    link
    :title="table.title"
  ) 
</template>
<script setup>
import { useTablesStore } from '~/stores/tables'
const tablesStore = useTablesStore()
const props = defineProps(['rail'])
tablesStore.fetchTables()
</script>