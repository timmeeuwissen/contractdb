<template lang="pug">
//- list all databases that are allowed to be showed here
v-container
  v-row.flex-nowrap
    v-col(cols="2")
      v-row
        v-btn(
          icon="mdi-home-outline"
          to="/"
        )
        v-spacer
        v-switch(
          v-model="debugStore.active"
          color="primary"
          label="Debugging"
        )
        v-select(
          label="Language",
          v-model="locale"
          :items="locales"
        )
      v-card(
        prepend-icon="mdi-dots-horizontal"
        variant="tonal"
        title="Menu"
      )
        v-card-text
          | Select where you want to go
      datasets-component
      graphs-component
    v-col(cols="10").justify.pt-15
      slot
</template>
<script setup>
import { useDebugStore } from '~/stores/debug'
import DatasetsComponent from '~/components/menu/datasets'
import GraphsComponent from '~/components/menu/graphs'
const { locale, locales } = useI18n()

const debugStore = useDebugStore()
</script>