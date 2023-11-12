<template lang="pug">
v-table
  thead
    tr
      th All Views
  tbody
    tr(v-for="view in props.tablesStore.views")
      td 
        v-btn(
          variant="plain" 
          @click="tableModel = view.Name"
          density="compact"
        ) {{ view.Name }}
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