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
    template(v-slot:text v-if="record")
      v-table
        tbody
          tr(
            v-for="(val, field) in record" :set="def = definition[field]"
          )
            th
              | {{ def.title }}
              v-icon(
                icon="mdi-delta"
                v-if="delta && field in delta.changed"
              )
              v-icon(
                icon="mdi-alert-circle"
                v-if="delta && field in delta.violations"
              )
            td
              template(v-if="def.mutable")
                v-text-field(
                  v-if="def.type.match(/LONG|INT/) && !def.constraint"
                  v-model="record[field]"
                  hide-details
                  single-line   
                  type="number"
                  density="compact"
                  :color="delta && field in delta.violations ? 'error' : undefined"
                )            
                v-autocomplete(
                  v-if="def.constraint"
                  v-model="record[field]"
                  :items="autocompleteStore.completerData(def.constraint.table)"
                )
                  template(v-slot:append)
                    v-btn(
                      icon="mdi-pencil"
                      :disabled="record[field] ? false : true"
                      density="compact"
                      variant="plain"
                      :to="`/table/${definition[field].constraint.table}/${record[field]}`"
                    )
                    v-btn(
                      icon="mdi-table"
                      density="compact"
                      variant="plain"
                      :to="`/table/${definition[field].constraint.table}`"
                    )
                v-text-field(
                  v-if="def.type.match(/STRING/) && !def.constraint"
                  v-model="record[field]"
                  hide-details
                  single-line
                  density="compact"
                  :color="delta && field in delta.violations ? 'error' : undefined"
                )
                v-switch(
                  v-if="def.type.match(/TINY|BOOL/)"
                  v-model="record[field]"
                  color="primary"
                  false-value="0"
                  true-value="1"
                  hide-details
                )
                date-input(
                  v-if="def.type == 'DATE'" 
                  v-model="record[field]"
                  v-bind:min="('dateDelimiter' in def) && ('min' in def.dateDelimiter) && ('target' in def.dateDelimiter.min) ? record[def.dateDelimiter.min.target] : false"
                  v-bind:max="('dateDelimiter' in def) && ('max' in def.dateDelimiter) && ('target' in def.dateDelimiter.max) ? record[def.dateDelimiter.max.target] : false"
                )
              template.immutable(v-else) {{ val }}
            td(v-if="debugStore.active")
              v-tooltip(:text="`type: ${def.type} ${def.constraint ? ', constraint: ' + [def.constraint.table, def.constraint.column].join('.') : ''}`") 
                template(v-slot:activator="{ props }")
                  v-icon(v-bind="props" color="grey-lighten-1") mdi-help

    template.loading(v-else v-slot:text) Loading

  v-card(
    v-if="referencedBy && referencedBy.length"
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
          tr(v-for="reference in referencedBy") 
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
import { useRecordsStore } from '~/stores/records'
import dateInput from '~/components/dateInput'
import { useDebugStore } from '~/stores/debug'
import { useAutocompleteStore } from '~/stores/autocomplete'
import { reactive } from 'vue'

const route = useRoute(),
  table = route.params.table,
  id = route.params.id,
  recordsStore = useRecordsStore(),
  debugStore = useDebugStore(),
  autocompleteStore = useAutocompleteStore()

recordsStore.fetchRecord(table, id)
autocompleteStore.fetchCompleterData(table)

const record = computed(() => recordsStore.record(table, id))
const definition = computed(() => recordsStore.definition(table))
const referencedBy = computed(() => recordsStore.referencedBy(table))
const delta = computed(() => recordsStore.delta(table, id))

watch(recordsStore.record(table,id), (newVal) => {
  console.log('fetching deltas', newVal)
  recordsStore.fetchDelta(table, id, newVal)
})

const title = computed(() => {
  const rec = recordsStore.record(table, id)
  if (!rec) return {
    icon: undefined,
    label: undefined
  }
  const def = recordsStore.definition(table)
  return {
    icon: def._tableIcon,
    label: def._tableTitle + ': '
      + def._identifiedBy.replaceAll(
        /\{\{\s?(.*?)\s\}\}/g, 
        (_match, field) => rec[field]
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