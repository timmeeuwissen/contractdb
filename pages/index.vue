<template lang="pug">
v-card
  v-table
    thead
      tr
        th Dataset
    tbody
      tr(v-for="table in tables")
        td 
          NuxtLink(:href="`/table/${table.tableName}`") {{ table.tableName }}
</template>
<script setup>
const tableData = await useFetch('/api/tables')
const tables = tableData.data
console.log(tables);
</script>