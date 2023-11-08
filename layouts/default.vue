<template lang="pug">
div.d-flex.align-center.flex-column.mt-4
  v-btn(
    icon="mdi-home-outline"
    to="/"
  )
  v-switch(
    v-model="debugStore.active"
    color="primary"
    label="Debugging"
  )
  slot
</template>
<script setup>
import { useDebugStore } from '~/stores/debug'

const debugStore = useDebugStore()
</script>