<template lang="pug">
| columns
| {{ props.debugDefinitionStore.perTable }}
v-table(
  hover 
  v-if="props.debugDefinitionStore.perTable && props.debugDefinitionStore.perTable.columns"
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
    tr(v-for="column in props.debugDefinitionStore.perTable.columns")
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
const props = defineProps(['modelValue', 'debugDefinitionStore'])

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