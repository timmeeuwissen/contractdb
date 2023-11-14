<template lang="pug">
//- list all databases that are allowed to be showed here
v-container
  v-navigation-drawer(
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
  )
    v-list-item(
      title="Menu"
      variant="tonal"
      nav
    )
      template(v-slot:prepend)
        v-icon.ml-2(icon="mdi-menu")
      template(v-slot:append)
        v-btn(
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="rail = !rail"
        )
    v-list(density="compact")
      v-list-item(
        link
        variant="text"
        to="/"
        title="Home"
        prepend-icon="mdi-home"
      )
    v-divider
    v-spacer
    v-divider
    datasets-component(v-bind:rail="rail")
    v-divider
    graphs-component(v-bind:rail="rail")
    v-divider
    v-switch.mx-2(
      v-model="debugStore.active"
      color="primary"
      :label="rail ? undefined : 'Debugging'"
    )
    v-select(
      v-if="!rail"
      label="Language",
      v-model="locale"
      :items="locales"
    )
  v-main
    slot
</template>
<script setup>
import { useDebugStore } from '~/stores/debug'
import DatasetsComponent from '~/components/menu/datasets'
import GraphsComponent from '~/components/menu/graphs'
import {ref} from 'vue'
const { locale, locales } = useI18n()
const drawer = ref(true)
const rail = ref(true)
const debugStore = useDebugStore()
</script>