<template lang="pug">
v-table
  thead
    tr
      th All Procedures
  tbody
    tr(v-for="procedure in props.tablesStore.procedures")
      td 
        v-btn(
          variant="plain" 
          density="compact"
        ) {{ procedure.Name }}
  </template>
  <script setup>
  const props = defineProps(['tablesStore'])
  </script>