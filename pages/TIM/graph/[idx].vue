<template lang="pug">
template(
  v-if="graphsStore.graphs[parseInt(route.params.idx)]"
)
  v-card(
    :set="graphConf = graphsStore.graphs[parseInt(route.params.idx)]"
    prepend-icon="mdi-chart-bar",
    :title="`Graph: ${graphConf.title}`"
    :text="graphConf.description"
    variant="tonal"
  )
</template>
<script setup>
import { useGraphsStore } from '~/stores/graphs'
const route = useRoute()
const graphsStore = useGraphsStore()
  
graphsStore.fetchGraphs()
</script>