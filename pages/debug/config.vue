<template lang="pug">
v-card(variant="tonal")
  v-card-title Configuration
  v-card-text 
    | Here you can find how the application is configured.  
v-card(prepend-icon="mdi-table" title="Table configuration")
  v-card-text
    v-data-table(
      :headers="tableConfHeaders"
      :items="tablesStore.tables"
      item-value="tableName"
      show-expand
      hover
    )
      template(#[`item.inListing`]="{item}")
        v-icon(:icon="item.raw.inListing ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'")
      
      template(#expanded-row="{ columns, item }")
        tr
          td(:colspan="columns.length" v-if="tableConfiguration[item.raw.tableName] && ('fields' in tableConfiguration[item.raw.tableName])")
            v-table.text-caption
              thead
                tr
                  th Field
                  th Config
              tbody
                tr(v-for="(fieldConfig, field) in tableConfiguration[item.raw.tableName].fields")
                  td {{ field }}
                  td 
                    pre {{ JSON.stringify(fieldConfig, null, 2) }}

          td.text-disabled(:colspan="columns.length" v-else)
            | There is no field information set for this table

v-card(prepend-icon="mdi-database" title="Importers")
  v-card-text
    v-data-table(
      :headers="importHeaders"
      :items="importRows"
      item-value="importer"
      density="compact"
      hover,
      show-expand
    )
      template(#[`item.parserConfig`]="{item}")
        v-tooltip(:text="JSON.stringify(item.raw.parserConfig, null, 2)") 
          template(v-slot:activator="{ props }")
            v-icon(v-bind="props" color="grey-lighten-1") mdi-cog-outline 
        v-btn(icon="mdi-file-tree-outline" density="compact" variant="plain" :to="item.raw.targUrl")
      template(#expanded-row="{ columns, item }")
        tr
          td(:colspan="columns.length")
            v-table.text-caption(density="compact")
              thead
                tr
                  th Source Key
                  th Target field(s)
                  th Method
              tbody
                tr(v-for="(fieldDef, srcKey) in item.raw.modelMap")
                  th {{ srcKey }}
                  td.text-disabled(v-if="!fieldDef" colspan="2") Not imported
                  td(v-if="fieldDef") 
                    pre {{ JSON.stringify(fieldDef.target, null, 2) }}
                  td(v-if="fieldDef")
                    template(v-if="fieldDef.args")
                      v-tooltip( :text="JSON.stringify(fieldDef.args, null, 2)") 
                        template(v-slot:activator="{ props }")
                          span(v-bind="props") {{ fieldDef.method }}
                    template(v-else) {{ fieldDef.method }}  

    v-list(lines="one")
      v-list-item(to="/import")
        template(v-slot:prepend)
          v-icon(icon="mdi-database-import-outline")
        v-list-item-title Migration wizard
        v-list-item-subtitle Import and export data to and from your database

</template>
<script setup>
// todo : protect from showing when not in dev mode
// todo : shield database information
import { acceptHMRUpdate } from 'pinia';
import { tableConfiguration, imports } from '~/config.json'
import { useTablesStore } from '~/stores/tables'

const tablesStore = useTablesStore()

// table config
const tableConfHeaders = [
  { title: 'Table', key: 'tableName', align: 'begin', sortable: true},
  { title: 'In Menu', key: 'inListing', align: 'begin', sortable: true},
  { title: 'Identified by', key: 'identifiedBy', align: 'begin', sortable: true}
]

// importer
const importHeaders = [
  { title: 'Importer', key: 'importer', align: 'begin', sortable: true },
  { title: 'Type', key: 'type', align: 'end', sortable: true }, 
  { title: '', key: 'parserConfig', align: 'end', sortable: false },  
]
const importRows = Object.entries(imports).reduce(
  (acc, [importer, {type, parserConfig, modelMap}]) => ([
    ...acc,
    { 
      importer,
      type,
      parserConfig,
      modelMap,
      targUrl: `/import/tree/${importer}`
    }
  ]), 
  []
)
</script>