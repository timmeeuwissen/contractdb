<template lang="pug">
v-card 
  h1 list {{ route.params.table }}
  v-table.tableList
    thead
      tr
        template(v-for="def in data.definitions")
          //- skipping all records prefixed with underscore
          //- those are informationsets targetet for visual aid
          th(v-if="!def.name.match(/^_/)") {{ def.name }}
        th 
    tbody
      tr(v-for="record in data.records")
        //- todo : enable concatenation of all primary keys for in-place patch strategy
        template(v-for="def in data.definitions")
          //- skipping all records prefixed with underscore
          //- those are informationsets targetet for visual aid
          td(v-if="!def.name.match(/^_/)" :class="def.name in data.foreignKeys.references ? 'foreignValue' : undefined") 
            template(v-if="def.name in data.foreignKeys.references") 
              //- in case the connection exists, interpolate the identifiedBy string
              template(v-if="record[`_${def.name}_exists`]")
                | {{ 
                | data.tableConfiguration[
                |   data.foreignKeys.references[def.name].table
                | ].identifiedBy.replaceAll(
                |   /\{\{\s?(.*?)\s\}\}/g, 
                |   (match, joinCol) => record[`_${def.name}_iBy_${joinCol}`]
                | ) 
                | }}
                NuxtLink.action(:href="`/table/${data.foreignKeys.references[def.name].table}/${record[def.name]}`")
                  v-icon(icon="mdi-text-box-edit-outline")
              //- in case it doesn't exist, show that there's no relation been made
              span.unavailable(v-else) not-linked
            template(v-else) {{ record[def.name] }}
        td.actionCol
          //- todo : get the primary key and go to the detail page
          NuxtLink.action(:href="`/table/${route.params.table}/TODO_ID`")
            v-icon(icon="mdi-text-box-edit-outline")
</template>
<script setup>
const route = useRoute()
const {data} = useFetch(`/api/table/${route.params.table}`)
</script>
<style lang="sass" scoped>
.tableList
  .unavailable
    color: #ccc
    font-style: italic
  .foreignValue
      .action
        display: none
      &:hover
        .action 
          display: inline-block
  tr
    .actionCol
      .action
        color: rgba(200, 200, 200, 100)
  tr:hover
    .actionCol
      .action
        color: rgba(0, 0, 0, 255)
</style>