<template lang="pug">
v-card
  v-card-title Importer configuration
  v-card-text
    pre {{ data.importerConfig }}
v-card
  v-card-title Mapping to table
  v-card-text
    v-table
      thead
        tr
          th Source Field 
          th Target Column
      tbody
        tr(v-for="[key, target] in Object.entries(data.keysToField)")
          td {{ key }}
          td {{ target.join('.') }}
v-card
  v-card-title Mapping to database (relational)
  tree(
    :tree-data="data.tree",
    :icon-map="iconMap"
    v-on:info-request="showInfo"
  )
v-card(
  v-if="infoData.event"
) 
  v-card-title Info 
    template(
      v-for="evt in infoData.event"
    ) 
      v-icon(
        v-if="evt.type in iconMap"
      ) {{ iconMap[evt.type] }}
      | {{ evt.title }}
      v-spacer
  v-card-text
    pre {{ infoData.deepest }}
      
</template>
<script setup>
const route = useRoute()
import tree from '~/components/tree.vue' 
import { reactive } from 'vue'

const infoData = reactive({})

const {data} = await useFetch(`/api/import/meta/${route.params.importType}`)
const iconMap = {
  database: 'mdi-database-outline',
  table: 'mdi-table',
  field: 'mdi-table-split-cell', 
}

const showInfo = (evt) => {
  infoData.event = evt
  infoData.deepest = evt[evt.length - 1]
}

const closeInfo = () => {
  infoData.event = undefined
  infoData.deepest = undefined
}

</script>