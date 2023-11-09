<template lang="pug">
v-card(
  variant="tonal" 
  :title="`Importer ${ route.params.importType } : Effectuation`"
  prepend-icon="mdi-file-tree-outline"
)
  v-card-text
    | This is where you can see the implications of the configuration of the importer.
    | You are now looking at how the importer maps the fields towards the database, and 
    | vice versa.
v-card
  v-card-title Mapping to table
  v-card-text
    v-table
      thead
        tr
          th Source Field 
          th Target Column
          th Database type (coercion)
      tbody
        tr(v-for="(props, key) in data.keysToField")
          td {{ key }}
          td {{ props.path.join('.') }}
          td(v-if="!props.properties || !props.properties.Type").text-disabled Invalid mapping
          td(v-else) {{ props.properties.Type }}
v-row
  v-col(cols="4")
    v-card
      v-card-title RDBMS Mapping
      v-card-text
        span {{ openedPath }}
        tree(
          :tree-data="data.tree",
          :icon-map="iconMap"
          :opened-path="openedPath"
          v-on:info-request="showInfo"
        )
  v-col(cols="8")
    v-card(
      v-if="infoData.event"
    ) 
      v-card-title Path: 
        template(
          v-for="(evt, idx) in infoData.event"
        ) 
          v-icon(icon="mdi-chevron-right" v-if="idx")
          v-icon(
            v-if="evt.type in iconMap"
          ) {{ iconMap[evt.type] }}
          span {{ evt.title }}
      v-card-text
        v-table
          tbody
            tr 
              th Type 
              td {{ infoData.deepest.type }}
            tr
              th Name
              td {{ infoData.deepest.title }}
            tr(v-if=" infoData.deepest.type == 'field'")
              th Field coercion
              td(v-if="infoData.deepest.properties && infoData.deepest.properties.Type") {{ infoData.deepest.properties.Type }}
              td(v-else).text-disabled Invalid mapping {{ infoData.deepest }}
            tr(
              :set="meta = infoData.deepest.meta"
            )
              th Path
              td {{ [
                |   infoData.deepest.type == 'database' ? infoData.deepest.title : meta.database, 
                |   infoData.deepest.type == 'table' ? infoData.deepest.title : meta.table, 
                |   infoData.deepest.type == 'field' ? infoData.deepest.title : meta.field, 
                | ].filter(part => part).join('.') }}
        //- pre {{ infoData.deepest }}
    v-card(
      v-if="infoData.event && 'children' in infoData.deepest"
      prepend-icon="mdi-human-male-girl"
      title="Children"
    ) 
      v-card-text
        v-table
          thead
            tr
              th Type
              th Name
              th
          tbody
            tr(v-for="(child, childIndex) in infoData.deepest.children")
              td
                v-icon(
                  v-if="child.type in iconMap"
                ) {{ iconMap[child.type] }}
                span {{ child.type }}
              td {{ child.title }}
              td 
                v-btn(
                  density="compact" 
                  variant="plain" 
                  icon="mdi-chevron-right"
                  @click="openChild(childIndex)"
                )
            
</template>
<script setup>
const route = useRoute()
import tree from '~/components/tree.vue' 
import { reactive, ref } from 'vue'

const openedPath = ref([0])
const infoData = reactive({})

const openChild = (childIndex) => {
  openedPath.value = [...infoData.event.reduce((acc, ancestor) => ([...acc, ancestor.index]), []), childIndex]
}

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