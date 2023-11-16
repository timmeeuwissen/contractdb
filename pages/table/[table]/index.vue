<template lang="pug">
dataset-component(
  :records="data.records",
  :headers="data.headers",
  :tableConfiguration="data.tableConfiguration"
  :target="route.params.table"
  :identifiedPerField="data.identifiedPerField"
  :foreignKeys="data.foreignKeys"
  type="table"
)
</template>
<script setup>
import DatasetComponent from '~/components/dataSet.vue'

const route = useRoute()
const {data} = await useFetch(`/api/table/${route.params.table}`, {query: {format: 'ui'}})
</script>
