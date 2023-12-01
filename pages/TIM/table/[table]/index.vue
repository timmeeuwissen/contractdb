<template lang="pug">
dataset-component(
  :datasetStore="datasetStore",
  :datasetColumnsStore="datasetColumnsStore"
  :target="route.params.table"
  @edit="processEdit"
  @delete="processDelete"
  type="table"
)
</template>
<script setup>
import DatasetComponent from '~/components/dataset'
import { getDatasetStore } from '~/stores/dataset'
import { getDatasetColumnsStore } from '~/stores/datasetColumns'

const route = useRoute()
const datasetStore = getDatasetStore(route.params.table)
const datasetColumnsStore = getDatasetColumnsStore(route.params.table)

datasetStore.fetch_data()

const processEdit = evt => {
  navigateTo(`/TIM/${evt.type}/${evt.target}/${evt.PK}`)
}

const processDelete = evt => {
  // todo : delete the record.
}
</script>
