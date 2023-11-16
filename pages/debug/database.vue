<template lang="pug">
v-container 
  v-col(cols="4")
    v-card(
      prepend-icon="mdi-table"
      title="Tables"
    )
      database-tables(
        :queryablesStore="queryablesStore"
        v-model="tableModel"
      )
      database-views(
        :queryablesStore="queryablesStore"
        v-model="tableModel"
      )
      database-procedures(
        :queryablesStore="queryablesStore"
      )
  v-col(cols="6")
    | Selected Table: {{ tableModel }}
    | What we know: {{ tableData }}
    v-container
      v-row(rows="9")

      v-row(rows="3" v-if="tableModel")
        v-card(
          prepend-icon="mdi-table"
          :title="`Properties of table: ${tableModel}`"
        )
          v-tabs(
            v-model="showTab"
            bg-color="primary"
          )
            v-tab(value="Columns")
              | Columns
            v-tab(value="Indices")
              | Indices
            v-tab(value="Relations")
              | Relations
          v-card-text
            v-window(v-model="showTab")
              v-window-item(value="Columns")
                table-columns(
                  v-model="tableModel"
                  :definitionStore="definitionStore"
                )
              v-window-item(value="Indices")
                | Indices
              v-window-item(value="Relations")
                | Relations
</template>
<script setup>
import { ref } from 'vue'
import { useQueryablesStore } from '~/stores/tables'
import { useDefinitionStore } from '~/stores/definitions'

import DatabaseTables from '~/components/database/tables'
import DatabaseViews from '~/components/database/views'
import DatabaseProcedures from '~/components/database/procedures'

import TableColumns from '~/components/database/columns'

const definitionStore = useDefinitionStore()
const queryablesStore = useQueryablesStore()

const tableModel = ref('')
const showTab = ref('')
const tableData = ref({})

watch(tableModel, (table) => {
  if(table) {
    definitionStore.fetchTableData(table)
    tableData.value = definitionStore.tableData(table) 
  }
})
</script>