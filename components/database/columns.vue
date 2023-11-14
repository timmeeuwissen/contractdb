<template lang="pug">
| columns
| {{ props.definitionStore.perTable }}
v-table(
  hover 
  v-if="props.definitionStore.perTable && props.definitionStore.perTable.columns"
)

  thead
    tr
      th Field
      th Type
      th Collation
      th Null
      th Key
      th Default
      th Extra
      th Privileges
      th Comment
  tbody
    tr(v-for="column in props.definitionStore.perTable.columns")
    th Field
      td {{ column.Type }}
      td {{ column.Collation }}
      td {{ column.Null }}
      td {{ column.Key }}
      td {{ column.Default }}
      td {{ column.Extra }}
      td {{ column.Privileges }}
      td {{ column.Comment }}
</template>
<script setup>
const props = defineProps(['modelValue', 'definitionStore'])

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