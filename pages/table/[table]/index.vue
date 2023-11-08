<template lang="pug">
v-card(width="500" v-if="data")
  //- skipping all keys prefixed with underscore
  //- those are informationsets targetet for visual aid
  v-data-table.tableList(
    :headers="data.headers"
    :items="data.records"
    item-value="_PK"
    show-select
    v-model="selectedRecords"
  )
    template(v-slot:top)
      v-toolbar(flat)
        v-toolbar-title Records from {{ route.params.table }}
        v-divider.mx-4(inset vertical)
        v-spacer
        v-dialog(v-model="dialogDelete" max-width="500px")
          v-card
            v-card-title.text-h5 Are you sure you want to remove this item
            v-card-actions
              v-spacer
              v-btn(variant="text" @click="closeDelete()") Cancel
              v-btn(variant="text" @click="confirmDelete()") OK
              
    
    template(
      v-for="def in data.headers"
      #[`item.${def.key}`]="{ item }"
    ) 
      //- the last column where the buttons are
      template(
        v-if="def.key == 'actions'"
      )
        v-btn(icon="mdi-text-box-edit-outline" density="compact" :to="`/table/${route.params.table}/${item.raw._PK}`") 
        v-btn(icon="mdi-delete-outline" density="compact" @click="deleteItem(item)")
      
      //- a column which refers to an external record
      template(
        v-else-if="def.visualAid == 'relation'"
      )
        //- when there's a foreign key attached, we show the relevant information here
        template(v-if="item.raw[`_${def.key}_exists`]")
          //- todo : should be handled by helper function, but requires DB connection to resolve
          //-        the unique columns
          | {{ 
          | data.identifiedPerField[def.key].replaceAll(
          |   /\{\{\s?(.*?)\s\}\}/g, 
          |   (match, joinCol) => item.raw[`_${def.key}_iBy_${joinCol}`]
          | ) 
          | }}
          v-btn(
            icon="mdi-text-box-edit-outline"
            :to="`/table/${data.foreignKeys.references[def.key].table}/${item.raw[def.key]}`"
          )
        //- in case it doesn't exist, show that there's no relation been made
        span.unavailable(v-else) not-linked
      template(
        v-else
      ) {{ item.raw[def.key] }}

    
</template>
<script setup>
import { ref, watch } from 'vue'

const route = useRoute()
const {data} = useFetch(`/api/table/${route.params.table}`, {query: {format: 'ui'}})

const dialogDelete = ref(false)
const currentItem = ref({})
const selectedRecords = ref([])

watch(currentItem, (val) => { val || this.closeDelete })

const deleteItem = (item) => {
  currentItem.value = item
  dialogDelete.value = true
}

const closeDelete = () => {
  dialogDelete.value = false
  currentItem.value = {}
}
const confirmDelete = () => {
  closeDelete()
}


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