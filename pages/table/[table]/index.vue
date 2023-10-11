<template lang="pug">
h1 list {{ route.params.table }}
v-table
    thead
      tr
        th(v-for="def in data.definitions") {{ def.name }}
    tbody
      tr(v-for="record in data.records")
        td(v-for="value in record") {{ value }}
</template>
<script setup>
const route = useRoute()
const {data} = useFetch(`/api/table/${route.params.table}`)
</script>