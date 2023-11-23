<template lang="pug">
dataset-component(
  :datasetStore="datasetStore",
  :target="route.params.table"
  @edit="processEdit"
  @delete="processDelete"
  type="table"
)
</template>
<script setup>
import DatasetComponent from '~/components/dataset'
import { getDatasetStore } from '~/stores/dataset'

const route = useRoute()
const datasetStore = getDatasetStore(route.params.table)
datasetStore.fetch_data()

const processEdit = evt => {
  navigateTo(`/${evt.type}/${evt.target}/${evt.PK}`)
}

const processDelete = evt => {
  // todo : delete the record.
}
</script>
