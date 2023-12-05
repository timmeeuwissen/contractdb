<template lang="pug">
v-card
  v-card-title SQL Editor
  v-card-subtitle Press Ctrl-space for autocompletion
  v-card-text
    sql-editor(
      :code="code"
      ref="editor"
    )
  v-card-actions
    v-btn(
      @click="execute_activeQuery()"
    ) Execute active query
    v-btn(
      @click="execute_allQueries()"
      color="warning"
    ) Execute all queries

v-row
  v-col(cols="6")
    v-card(v-if="queryStore.history.length")
      v-card-title(
        prepend-icon="mdi-history"
      ) History
      v-card-text
        v-table(
          fixed-header="true"
        )
          thead
            tr
              th Query
              th Result (meta)
              th Action
          tbody
            tr(
              v-for="entry in queryStore.history.length"
            )
              td {{ entry.query }}
              td {{ entry.meta }}
              td
                v-tooltip( 
                  location="top"
                )
                  template( 
                    v-slot:activator="{ props: tooltip }"
                  )  
                    v-btn(
                      icon="mdi-pencil"
                      v-bind="{...tooltip}"
                      @click="amend_query(entry.query)"
                    ) 
    v-card(
      v-else
      variant="tonal"
    )
      v-card-title(
        prepend-icon="mdi-history"
      ) History
      v-card-text
        | Once you start running queries, you will be able to see 
        | the history of the queries you've ran.
  v-col(cols="6")
    v-card(v-if="queryStore.lastResult")

    v-card(
      v-else
      variant="tonal"
    )
      v-card-title(
        prepend-icon="mdi-history"
      ) Output metadata
      v-card-text
        | Once we have successfully executed your query, we'll show 
        | what we know about the result of the query.
</template>
<script setup>
import { useQueryStore } from '~/stores/query';
const code = ref('')
const editor = ref(null)
const queryStore = useQueryStore()

const execute_allQueries = () => {
  const queries = editor.get_allQueries()
  // todo : split queries on semicolon, but not when quoted
  queryStore.runQuery(queries)

}
const execute_activeQuery = () => {
  const query = editor.get_activeQuery()
  queryStore.runQuery(query)
}
</script>