<template lang="pug">
v-table
  thead
    tr
      th All Procedures
  tbody
    tr(v-for="procedure in props.queryablesStore.procedures")
      td 
        v-btn(
          variant="plain" 
          density="compact"
        ) {{ procedure.Name }}
  </template>
  <script setup>
  const props = defineProps(['queryablesStore'])
  </script>