<template lang="pug">
v-card(
  prepend-icon="mdi-table-arrow-right"
  :title="props.title"
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
          @click="emit('clicked:queryable', {type: 'table', target: table.tableName, props: table})"
        ) {{ table.tableName }}
        
    v-list(density="compact" v-if="queryablesStore.views.length")
      v-list-item(variant="tonal").bg-color-primary.font-weight-bold Views
      v-list-item
        v-btn(
          v-for="view in queryablesStore.views"
          prepend-icon="mdi-database-eye"
          variant="plain" 
          @click="emit('clicked:queryable', {type: 'view', target: view.Name, props: view})"
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
          @click="emit('clicked:queryable', {type: 'procedure', target: procedure.Name, props: procedure})"
        ) {{ procedure.Name }}
</template>
<script setup>
import {useQueryablesStore} from '~/stores/queryables'
const queryablesStore = useQueryablesStore()
queryablesStore.fetchTables()
const emit = defineEmits(['clicked:queryable'])
const props = defineProps(['title'])
</script>