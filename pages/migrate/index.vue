<template lang="pug">
import-component
export-component
queryables-component(
  title="Download a queryable into a CSV"
)
</template>
<script setup>
import ImportComponent from '~/components/migrate/import'
import ExportComponent from '~/components/migrate/export'
import QueryablesComponent from '~/components/database/queryables.vue';
</script>