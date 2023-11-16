<template lang="pug">
v-table
  thead
    tr
      th All Tables
  tbody
    tr(v-for="table in props.queryablesStore.tables")
      td 
        v-btn(
          variant="plain" 
          @click="tableModel = table.tableName"
          density="compact"
        ) {{ table.tableName }}
</template>
<script setup>
const props = defineProps(['modelValue', 'queryablesStore'])
const emit = defineEmits(['clicked:modelValue'])

const tableModel = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

</script>