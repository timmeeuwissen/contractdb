<template lang="pug">
v-data-table(:headers="headers" :items="items")
  template(v-slot:[`item.description`])
    td
      template
        v-treeview(:items="tree")
</template>
<script setup>
const route = useRoute()

// const tree = await useFetch(
//   `/api/import/meta/${route.params.importType}`, 
//   { 
//     method: 'GET',
//   }
// )
const headers = [
    { text: 'Name', value: 'name'},
    { text: 'Description', value: 'description'},
]

const items = [
  { name: 'Item1', description: 'description1'},
  { name: 'Item2', description: 'description2'},
]

</script>