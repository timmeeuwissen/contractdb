<template lang="pug">
v-dialog(v-model="dialogDelete" max-width="500px")
  v-card
    v-card-title.text-h5 Are you sure you want to remove this item
    v-card-actions
      v-spacer
      v-btn(variant="text" density="compact" @click="closeDelete()") Cancel
      v-btn(variant="text" density="compact" @click="confirmDelete()") OK

v-card(v-if="dataReady")
  //- skipping all keys prefixed with underscore
  //- those are informationsets targetet for visual aid
  v-data-table.tableList(
    :headers="props.headers.map(header => ({...header, align: !(header.title in columnChecked) ? 'd-none': header.align }))"
    :items="props.records"
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
            :icon="props.tableConfiguration.icon"
          )
          span.ml-3 Records from {{ props.tableConfiguration.title || props.target }}
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
            v-list-item.text-no-wrap(
              draggable
              v-for="(column, index) in columnOrder.length"
              :key="index"
            )
              input(
                v-model="columnOrder"
                type="hidden"
              )
              v-checkbox(
                prepend-icon="mdi-drag-horizontal"
                :label="column"
                :v-model="columnChecked[column]"
                density="compact"
                hide-details
              )
              
    //- todo : translate header columns
    template(
      v-for="def in props.headers"
      #[`column.${def.key}`]="{column}"
    ) {{ column.title }}

    template(
      v-for="def in props.headers"
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
          @click=`emit('edit', {
              type: 'table',
              target: route.params.table,
              PK: item.raw._PK,
            })`
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
              | props.identifiedPerField[def.key].replaceAll(
              |   /\{\{\s?(.*?)\s\}\}/g, 
              |   (match, joinCol) => item.raw[`_${def.key}_iBy_${joinCol}`]
              | ) 
              | }}
            v-col.text-right
              v-btn(
                variant="plain"
                icon="mdi-text-box-edit-outline"
                density="compact"
                @click=`emit('edit', {
                    type: 'table',
                    target: props.foreignKeys.references[def.key].table,
                    PK: item.raw[def.key],
                  })`
              )
        //- in case it doesn't exist, show that there's no relation been made
        span.text-disabled(v-else) not-linked
      template(
        v-else
      ) {{ item.raw[def.key] }}

    
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps(['headers', 'records', 'tableConfiguration', 'target', 'type', 'identifiedPerField', 'foreignKeys'])
const emit = defineEmits('delete', 'edit')
const route = useRoute()

const dialogDelete = ref(false)
const currentItem = ref({})
const selectedRecords = ref([])
const columnOrder = ref({})
const columnChecked = ref({})

const dataReady = ref(false)
Promise.resolve(props.records).then(()=>{ dataReady.value=true })

watch(props.headers, (newVal) => {
  columnChecked.value = newVal.reduce((acc, header) => ({...acc, [header.title]: true}), {})
  columnOrder.value = newVal.map(header => header.title)
})

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
  emit('delete', currentItem)
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