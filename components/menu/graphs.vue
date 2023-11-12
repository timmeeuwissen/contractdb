<template lang="pug">
v-card(
  prepend-icon="mdi-chart-bar"
  title="Graphs"
  v-if="graphsStore.graphs"
)
  v-card-text
    v-table
      tbody
        tr(v-for="(graph, graphIndex) in graphsStore.graphs")
          td 
            NuxtLink(:to="`/graph/${graphIndex}`") {{ graph.title }}
  </template>
  <script setup>
  import { useGraphsStore } from '~/stores/graphs'
  const graphsStore = useGraphsStore()
  
  graphsStore.fetchGraphs()
  </script>