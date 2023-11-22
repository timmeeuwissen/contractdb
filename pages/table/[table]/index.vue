<template lang="pug">
dataset-component(
  :records="data.records",
  :headers="data.headers",
  :tableConfiguration="data.tableConfiguration"
  :target="route.params.table"
  :identifiedPerField="data.identifiedPerField"
  :identifiedPerTable="data.identifiedPerTable"
  :foreignKeys="data.foreignKeys"
  @edit="processEdit"
  @delete="processDelete"
  type="table"
)
</template>
<script setup>
import DatasetComponent from '~/components/dataset'

const route = useRoute()
const {data} = await useFetch(`/api/table/${route.params.table}`, {query: {format: 'ui'}})

const processEdit = evt => {
  navigateTo(`/${evt.type}/${evt.target}/${evt.PK}`)
}

const processDelete = evt => {
  // todo : delete the record.
}
</script>
