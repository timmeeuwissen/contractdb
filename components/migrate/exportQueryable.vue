<template lang="pug">
v-card(
  prepend-icon="mdi-table-arrow-right"
  title="Download a queryable into a CSV"
)
  v-card-text(density="compact")
    v-list(density="compact" v-if="queryablesStore.tables.length")
      v-list-item(variant="tonal" fixed).bg-color-primary.font-weight-bold Tables
      v-list-item
        v-btn(
          v-for="table in queryablesStore.tables"
          prepend-icon="mdi-table"
          variant="plain" 
          density="compact"
        ) {{ table.tableName }}
        
    v-list(density="compact" v-if="queryablesStore.views.length")
      v-list-item(variant="tonal").bg-color-primary.font-weight-bold Views
      v-list-item
        v-btn(
          v-for="view in queryablesStore.views"
          prepend-icon="mdi-database-eye"
          variant="plain" 
          density="compact"
        ) {{ view.Name }}

    v-list.align-end( v-if="queryablesStore.procedures")
      v-list-item(variant="tonal" fixed).bg-color-primary.font-weight-bold Procedures
      v-list-item
        v-btn(
          v-for="procedure in queryablesStore.procedures"
          prepend-icon="mdi-xml"
          variant="plain" 
          density="compact"
        ) {{ procedure.Name }}
</template>
<script setup>
import {useTablesStore} from '~/stores/tables'
const queryablesStore = useTablesStore()
queryablesStore.fetchTables()
</script>