<template lang="pug">
v-table
  thead
    tr
      th All Tables
  tbody
    tr(v-for="table in props.tablesStore.tables")
      td 
        v-btn(
          variant="plain" 
          @click="tableModel = table.tableName"
          density="compact"
        ) {{ table.tableName }}
</template>
<script setup>
const props = defineProps(['modelValue', 'tablesStore'])
const emit = defineEmits(['update:modelValue'])

const tableModel = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

</script>