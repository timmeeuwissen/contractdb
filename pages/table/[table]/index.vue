<template lang="pug">
v-dialog(v-model="dialogDelete" max-width="500px")
  v-card
    v-card-title.text-h5 Are you sure you want to remove this item
    v-card-actions
      v-spacer
      v-btn(variant="text" density="compact" @click="closeDelete()") Cancel
      v-btn(variant="text" density="compact" @click="confirmDelete()") OK

v-card(v-if="data")
  //- skipping all keys prefixed with underscore
  //- those are informationsets targetet for visual aid
  v-data-table.tableList(
    :headers="data.headers.map(header => ({...header, align: !(header.title in columnChecked) ? 'd-none': header.align }))"
    :items="data.records"
    item-value="_PK"
    show-select
    density="compact"
    hover
    v-model="selectedRecords"
  )
    template(v-slot:top="{ columns }")
      v-toolbar(flat)
        v-toolbar-title
          v-icon(
            :icon="data.tableConfiguration.icon"
          )
          span.ml-3 Records from {{ data.tableConfiguration.title || route.params.table }}
        v-divider.mx-4(inset vertical)
        v-menu(
          :close-on-content-click="false"
          location="start"
          density="compact"
        )
          template(
            v-slot:activator="{ props: menu }"
          )
            v-tooltip( 
              location="top"
            )
              template( 
                v-slot:activator="{ props: tooltip }"
              )  
                v-btn(
                  icon="mdi-checkbox-marked-circle-minus-outline"
                  v-bind="{...menu, ...tooltip}"
                ) 
              span Select which columns you want to see
          v-list(
            density="compact"
          )
            v-form(
              @prevent.default="updateColumns"    
            )
              v-list-item.text-no-wrap(
                draggable
                v-for="(column, index) in columnOrder.length? columnOrder : columns.reduce((acc, col) => ([...acc, col.title || undefined]), [])"
                :key="index"
              )
                input(
                  v-model="columnOrder"
                  type="hidden"
                )
                v-checkbox(
                  prepend-icon="mdi-drag-horizontal"
                  :label="column"
                  :v-model="columnChecked"
                  density="compact"
                  hide-details
                )
              
    //- todo : translate header columns
    template(
      v-for="def in data.headers"
      #[`column.${def.key}`]="{column}"
    ) {{ column.title }}

    template(
      v-for="def in data.headers"
      #[`item.${def.key}`]="{ item }"
    ) 
      //- the last column where the buttons are
      template(
        v-if="def.key == 'actions'"
      )
        v-btn(
          icon="mdi-text-box-edit-outline" 
          density="compact" 
          variant="plain"
          :to="`/table/${route.params.table}/${item.raw._PK}`"
        ) 
        v-btn(
          icon="mdi-delete-outline" 
          density="compact" 
          variant="plain"
          @click="deleteItem(item)"
        )
      
      //- a column which refers to an external record
      template(
        v-else-if="def.visualAid == 'relation'"
      )
        //- when there's a foreign key attached, we show the relevant information here
        template(v-if="item.raw[`_${def.key}_exists`]")
          v-row
            v-col.text-truncate
              //- todo : should be handled by helper function, but requires DB connection to resolve
              //-        the unique columns
              | {{ 
              | data.identifiedPerField[def.key].replaceAll(
              |   /\{\{\s?(.*?)\s\}\}/g, 
              |   (match, joinCol) => item.raw[`_${def.key}_iBy_${joinCol}`]
              | ) 
              | }}
            v-col.text-right
              v-btn(
                variant="plain"
                icon="mdi-text-box-edit-outline"
                density="compact"
                :to="`/table/${data.foreignKeys.references[def.key].table}/${item.raw[def.key]}`"
              )
        //- in case it doesn't exist, show that there's no relation been made
        span.text-disabled(v-else) not-linked
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
const columnOrder = ref([])
const columnChecked = ref([])

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