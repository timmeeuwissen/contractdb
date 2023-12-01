<template lang="pug">
codemirror-component(
  v-model:value="props.code"
  :options="cmOptions"
  border
  :height="200"
)
</template>
<script setup>
const props = defineProps('code')


import CodemirrorComponent from 'codemirror-editor-vue3'
// import { sqlLanguage } from '@codemirror/lang-sql'
import "codemirror/mode/sql/sql"
import "codemirror/addon/hint/show-hint"
import "codemirror/addon/hint/sql-hint"
import { MySQL } from '@codemirror/lang-sql'
import { useQueryablesStore } from '~/stores/queryables'

const queryableStore = useQueryablesStore()
await queryableStore.fetchTables()
// view.state.selection.main.head

const cmOptions = {
  mode: "text/x-mysql",
  extraKeys: {"Ctrl-Space": "autocomplete"}, // To invoke the auto complete
  hint: CodeMirror.hint.sql,
  hintOptions: {
    dialect: MySQL,
    // schemas
    // defaultschema
    tables: queryableStore.schema
  }
}

const amend_query = (historyQuery) => {
  const trimmedCode = code.value.trim()
  if(trimmedCode) {
    if(trimmedCode.charAt(-1) != ';') {
      code.value += ';'
    }
    code.value += `\n\n`
  }
  code.value += `${historyQuery};\n`
}

const get_allQueries = () => {
  return props.code.value
}

const get_activeQuery = () => {

}

defineExpose({
  get_allQueries,
  get_activeQuery,
})
</script>
