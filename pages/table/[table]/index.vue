<template lang="pug">
h1 list {{ route.params.table }}
v-table
    thead
      tr
        template(v-for="def in data.definitions")
          //- skipping all records prefixed with underscore
          //- those are informationsets targetet for visual aid
          th(v-if="!def.name.match(/^_/)") {{ def.name }}
    tbody
      tr(v-for="record in data.records")
        //- todo : enable concatenation of all primary keys for in-place patch strategy
        template(v-for="def in data.definitions")
          //- skipping all records prefixed with underscore
          //- those are informationsets targetet for visual aid
          td(v-if="!def.name.match(/^_/)") 
            template(v-if="def.name in data.foreignKeys.references") 
              template(v-if="record[`_${def.name}_exists`]")
                | {{ 
                | tableConfiguration[
                |   data.foreignKeys.references[def.name].table
                | ].identifiedBy.replaceAll(
                |   /\{\{\s?(.*?)\s\}\}/g, 
                |   (match, joinCol) => record[`_${def.name}_iBy_${joinCol}`]
                | ) 
                | }}
              span.unavailable(v-else) not-linked
            template(v-else) {{ record[def.name] }}
</template>
<script setup>
import {tableConfiguration} from '~/config.json'
const route = useRoute()
const {data} = useFetch(`/api/table/${route.params.table}`)
</script>
<style lang="sass" scoped>
.unavailable
  color: #ccc
  font-style: italic
</style>