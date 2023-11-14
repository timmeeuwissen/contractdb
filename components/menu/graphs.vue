<template lang="pug">
v-list(
  v-if="graphsStore.graphs"
  density="compact"
  nav
) 
  v-list-item.bg-primary(
    variant="tonal"
    title="Graphs"
    subtitle="Different ways to looking at your data"
    prepend-icon="mdi-chart-bar"
  )
  v-list-item(
    v-for="(graph, graphIndex) in graphsStore.graphs.filter(graph => !props.rail || (props.rail && graph.icon))"
    :to="`/graph/${graphIndex}`"
    :prepend-icon="graph.icon"
    link
    :title="graph.title"
  ) 
</template>
<script setup>
import { useGraphsStore } from '~/stores/graphs'
const graphsStore = useGraphsStore()
const props = defineProps(['rail'])

graphsStore.fetchGraphs()
</script>