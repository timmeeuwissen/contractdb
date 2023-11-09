<template lang="pug">
v-card(width="80%")
  template(v-slot:title) {{ table }}: {{ id }}
v-form(
  @prevent.default="updateRecord"
  ref="dataForm"
)
  v-card(width="80%")
    template(v-slot:title).text-left data
    template(v-slot:text v-if="record")
      v-table
        tbody
          tr(v-for="(val, field) in record" :set="def = definition[field]")
            th {{ def.title }}
            td
              template(v-if="def.mutable")
                v-text-field(
                  v-if="def.type.match(/LONG|INT/) && !def.constraint"
                  v-model="record[field]"
                  hide-details
                  single-line   
                  type="number"
                  density="compact"
                )            
                v-autocomplete(
                  v-if="def.constraint",
                  v-model="record[field]"
                  :items="autocompleteStore.completerData(def.constraint.table)"
                )
                v-text-field(
                  v-if="def.type.match(/STRING/) && !def.constraint"
                  v-model="record[field]"
                  hide-details
                  single-line
                  density="compact"
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

    template.loadineg(v-else v-slot:text) Loading
</template>
<script>
import { useRecordsStore } from '~/stores/records'
import dateInput from '~/components/dateInput'
import { useDebugStore } from '~/stores/debug'
import { useAutocompleteStore } from '~/stores/autocomplete'

export default {
  async setup() {
    const route = useRoute(),
      table = route.params.table,
      id = route.params.id,
      recordsStore = useRecordsStore(),
      debugStore = useDebugStore(),
      autocompleteStore = useAutocompleteStore()
    
    recordsStore.fetchRecord(table, id)
    autocompleteStore.fetchCompleterData(table)

    return {
      recordsStore,
      debugStore,
      autocompleteStore,
      table,
      id
    }
  },
  computed: {
    record() {
      return this.recordsStore.record(this.table, this.id)
    },
    definition() {
      return this.recordsStore.definition(this.table)
    }
  },
  methods: {
    updateRecord() {}
  }
}

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