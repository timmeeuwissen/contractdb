<template lang="pug">
v-list(
  v-if="queryablesStore.tables"
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
    v-for="table in queryablesStore.tables.filter(table => table.inListing && (!props.rail || (props.rail && table.icon)))"
    :to="`/table/${table.tableName}`"
    :prepend-icon="table.icon"
    link
    :title="table.title"
  ) 
</template>
<script setup>
import { useQueryablesStore } from '~/stores/tables'
const queryablesStore = useQueryablesStore()
const props = defineProps(['rail'])
queryablesStore.fetchTables()
</script>