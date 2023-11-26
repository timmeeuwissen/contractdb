<template lang="pug">
v-card(
  variant="tonal"
)
  template(
    v-slot:title
  ) 
    v-icon.mr-2(:icon="title.icon" v-if="title.icon")
    | {{ title.label }}
v-form(
  @prevent.default="updateRecord"
  ref="dataForm"
)
  v-card
    template(v-slot:title).text-left Record data
    template(v-slot:text v-if="recordStore.dataReady")
      v-table
        tbody
          tr(
            v-for="(val, field) in recordStore.record" :set="def = recordStore.definition[field]"
          )
            th
              | {{ def.title }}
              | {{ recordStore.decodedColumns }}
              //- v-icon(
              //-   icon="mdi-delta"
              //-   v-if="recordStore.delta && recordStore.delta.changed && field in recordStore.delta.changed"
              //- )
              //- v-icon(
              //-   icon="mdi-alert-circle"
              //-   v-if="recordStore.delta && recordStore.delta.violations && field in recordStore.delta.violations"
              //- )
            td
              template(v-if="def.mutable")
                v-text-field(
                  v-if="def.type.match(/LONG|INT/) && !def.constraint"
                  v-model="recordStore.record[field]"
                  hide-details
                  single-line   
                  type="number"
                  density="compact"
                  :color="recordStore.delta && recordStore.delta.violations && field in recordStore.delta.violations ? 'error' : undefined"
                )            
                v-autocomplete(
                  v-if="def.constraint"
                  v-model="recordStore.record[field]"
                  :placeholder="`Select a ${def.constraint.table}`"
                  :items="autocompleteStore.completerData(def.constraint.table)"
                )
                  template(v-slot:append)
                    v-btn(
                      icon="mdi-pencil"
                      :disabled="recordStore.record[field] ? false : true"
                      density="compact"
                      variant="plain"
                      :to="`/table/${recordStore.definition[field].constraint.table}/${recordStore.record[field]}`"
                    )
                    v-btn(
                      icon="mdi-table"
                      density="compact"
                      variant="plain"
                      :to="`/table/${recordStore.definition[field].constraint.table}`"
                    )
                v-text-field(
                  v-if="def.type.match(/STRING/) && !def.constraint"
                  v-model="recordStore.record[field]"
                  hide-details
                  single-line
                  density="compact"
                  :color="recordStore.delta && recordStore.delta.violations && field in recordStore.delta.violations ? 'error' : undefined"
                )
                v-switch(
                  v-if="def.type.match(/TINY|BOOL/)"
                  v-model="recordStore.record[field]"
                  color="primary"
                  false-value="0"
                  true-value="1"
                  hide-details
                )
                date-input(
                  v-if="def.type == 'DATE'" 
                  v-model="recordStore.record[field]"
                  v-bind:min="('dateDelimiter' in def) && ('min' in def.dateDelimiter) && ('target' in def.dateDelimiter.min) ? recordStore.record[def.dateDelimiter.min.target] : false"
                  v-bind:max="('dateDelimiter' in def) && ('max' in def.dateDelimiter) && ('target' in def.dateDelimiter.max) ? recordStore.record[def.dateDelimiter.max.target] : false"
                )
              template.immutable(v-else) {{ val }}
            td(v-if="debugStore.active")
              v-tooltip(:text="`type: ${def.type} ${def.constraint ? ', constraint: ' + [def.constraint.table, def.constraint.column].join('.') : ''}`") 
                template(v-slot:activator="{ props }")
                  v-icon(v-bind="props" color="grey-lighten-1") mdi-help

    template.loading(v-else v-slot:text) Loading

  v-card(
    v-if="recordStore.relatingRecords && recordStore.relatingRecords.length"
    prepend-icon="mdi-human-male-girl"
    title="Required by"
  )
    v-card-text
      v-table(
        hover
        density="compact"
      )
        thead 
          tr 
            th 
            th Type
            th Identified by
        tbody 
          tr(v-for="reference in recordStore.relatingRecords") 
            td
              v-btn(
                :to="`/table/${reference.Type}/${reference._PK}`"
                variant="plain"
                :icon="reference._tableIcon || 'mdi-pencil'"
              )
            td {{ reference._tableTitle}}
            td {{ reference.Ident }}
</template>
<script setup>
import { getRecordStore } from '~/stores/records'
import dateInput from '~/components/dateInput'
import { useDebugStore } from '~/stores/debug'
import { useAutocompleteStore } from '~/stores/autocomplete'
import { reactive } from 'vue'

const route = useRoute(),
  table = route.params.table,
  id = route.params.id,
  recordStore = getRecordStore(table, id),
  debugStore = useDebugStore(),
  autocompleteStore = useAutocompleteStore()

recordStore.fetchRecord()
autocompleteStore.fetchCompleterData(table)

const title = computed(() => {
  if (!('_identifiedBy' in recordStore.definition)) return {
    icon: undefined,
    label: undefined
  }
  return {
    icon: recordStore.definition._tableIcon,
    label: recordStore.definition_tableTitle + ': '
      + recordStore.definition._identifiedBy.replaceAll(
        /\{\{\s?(.*?)\s\}\}/g, 
        (_match, field) => recordStore.record[field]
      )  
  }
})

const updateRecord = () => {}

</script> 
<style lang="sass" scoped>
td 
  &.immutable
    font-style: italic
    color: #ccc

.loading 
  font-style: italic
  color: #ccc
  text-align: center
</style>