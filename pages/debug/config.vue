<template lang="pug">
v-card(width="80%")
  v-card-title Table configuration
  v-card-text
    pre.text-caption {{ tableConfiguration }}
v-card(width="80%")
  v-card-title Importers
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
      template(#expanded-row="{item}")
        td(colspan="4")
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

const importHeaders = [
  { title: 'Importer', key: 'importer', align: 'begin', sortable: true },
  { title: 'Type', key: 'type', align: 'end', sortable: true }, 
  { title: 'Information', key: 'parserConfig', align: 'end', sortable: false },  
]
const importRows = Object.entries(imports).reduce(
  (acc, [importer, {type, parserConfig, modelMap}]) => ([
    ...acc,
    { 
      importer,
      type,
      parserConfig,
      modelMap
    }
  ]), 
  []
)
</script>