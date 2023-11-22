<template lang="pug">
v-dialog(v-model="dialogDelete" max-width="500px")
  v-card
    v-card-title.text-h5 Are you sure you want to remove this item
    v-card-actions
      v-spacer
      v-btn(variant="text" density="compact" @click="closeDelete()") Cancel
      v-btn(variant="text" density="compact" @click="confirmDelete()") OK

v-dialog(v-model="dialogExport" max-width="500px")
  v-card
    v-card-title.text-h5 Are you sure you want to export?
    v-card-text 
      | This could take a while... But if you are certain of it, you might as well 
      | select the format in which you want to export it. Please notice that we will 
      | not limit the records to any filters you've possibly applied.
      v-radio-group(column v-model="exportFormat")
        v-radio(label="CSV" value="CSV")
        v-radio(label="JSON" value="JSON")
    v-card-actions
      v-spacer
      v-btn(variant="text" density="compact" @click="closeExport()") Cancel
      v-btn(
        variant="text" 
        density="compact" 
        :download="`${props.target}.${(new Date()).toISOString().split('T')[0]}.${exportFormat.toLowerCase()}`" 
        :href="`/api/export/${props.type}/${props.target}?format=${exportFormat}`" 
        @click="confirmExport()"
      ) Export

v-card(v-if="dataReady")
  //- skipping all keys prefixed with underscore
  //- those are informationsets targetet for visual aid
  v-data-table.tableList(
    :headers="headers"
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
        v-tooltip( 
          location="top"
        )
          template( 
            v-slot:activator="{ props: tooltip }"
          )  
            v-btn(
              :icon="quicklinksStore.get_queryable_state(props.target) ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"
              v-bind="{...tooltip}"
              @click="quicklinksStore.toggle_queryable(props.target)"
            ) 
          span Have as a quick-link on your homepage
        
        
        v-tooltip( 
          location="top"
        )
          template( 
            v-slot:activator="{ props: tooltip }"
          )  
            v-btn(
              icon="mdi-export"
              v-bind="{...tooltip}"
              @click="openExport()"
            ) 
          span Export this data

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
              v-for="(column, index) in columnOrder"
              :key="index"
            )
              input(
                v-model="columnOrder"
                type="hidden"
              )
              v-checkbox(
                prepend-icon="mdi-drag-horizontal"
                :label="column"
                v-model="columnChecked"
                :value="column"
                density="compact"
                :disabled="column in columnCanHide && columnCanHide[column] == false"
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
        v-tooltip 
          template(v-slot:activator="{ props }")
            span(v-bind="{...props}")
              v-btn(
                icon="mdi-delete-outline" 
                density="compact" 
                variant="plain"
                :disabled="item.raw._disableDelete > 0 ? true : false"
                @click="deleteItem(item)"
              )
          span(
            v-if="props.foreignKeys && Object.values(props.foreignKeys.referencedBy).length && props.identifiedPerTable"
          )
            p How many records relate to this record:
            ul(v-if="Object.keys(props.identifiedPerTable).length")
              li(
                v-for="(ident, identKey) in props.identifiedPerTable"
              ) 
                v-icon(
                  icon="mdi-check"
                  v-if="!item.raw[identKey] || ident.constraint.deleteRule != 'RESTRICT'"
                )
                v-icon(
                  icon="mdi-cancel"
                  v-else
                )
                | {{ ident.identifier }}: {{ item.raw[identKey] }}
            span(v-else) There are no (possible) relations to this record.
      
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
import { useQuicklinkStore } from '~/stores/quicklinks';

const props = defineProps([
  'headers', 
  'records', 
  'tableConfiguration', 
  'target', 
  'type', 
  'identifiedPerField', 
  'identifiedPerTable', 
  'foreignKeys',
  'uniques',
])
const emit = defineEmits(['delete', 'edit'])
const route = useRoute()

const quicklinksStore = useQuicklinkStore()

const dialogDelete = ref(false)
const currentItem = ref({})
const selectedRecords = ref([])
const columnOrder = ref({})
const columnChecked = ref({})
const headers = ref({})

const dialogExport = ref(false)
const exportFormat = ref('CSV')

const dataReady = ref(false)
const columnCanHide = computed(() => 
  props.headers.reduce((acc, header) => ({...acc, [header.title]: header.hideable}), {})
)

Promise.resolve(props.records).then(()=>{ dataReady.value=true })

watch(props.headers, (newVal) => {
  columnChecked.value = newVal.reduce((acc, header) => ([...acc, header.title]), [])
  columnOrder.value = newVal.map(header => header.title)
}, {immediate: true})

watch(currentItem, (val) => { val || this.closeDelete })

watch(
  columnChecked, 
  (newVal) => {
    const checkedObj = columnChecked.value.reduce((acc, col) => ({...acc, [col]: true}), {})
    const orderObj = Object.entries(columnOrder.value).reduce((acc, [k,v]) => ({...acc, [v]: k}), {})

    headers.value = 
      props.headers.reduce(
        (acc, header) => 
          (header.title in orderObj)
          && !(header.title in checkedObj)
          ? acc
          : [...acc, header], 
        []
      )
  },
  {immediate: true}
)
// deleting
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

// exporting
const openExport = () => {
  dialogExport.value = true
}

const closeExport = () => {
  dialogExport.value = false
}
const confirmExport = () => {
  closeExport()
}

// tooltips
const deleteTooltip = (item) => {
  if (!props.foreignKeys || !Object.values(props.foreignKeys.referencedBy).length || !props.identifiedPerTable) return ''
  return Object.keys(props.identifiedPerTable).reduce(
    (acc, reference) => {
      console.log(item, reference, item[reference])
      if (props.identifiedPerTable[reference])
        acc.push(`${props.identifiedPerTable[reference]}: ${item[reference]}`)
      return acc
    },
    []
  ).join(', ')
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