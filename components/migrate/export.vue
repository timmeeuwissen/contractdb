<template lang="pug">
v-form(
  v-if="Object.keys(importersStore.importers).length"
  @prevent.default="attemptExport"
  ref="exportForm"
)
  v-card
    v-card-title Exporter 
    v-card-text
      v-select(
        v-model="importType"
        :items="importersStore.importers"
        item-title="title"
        item-value="value"
        :rules="[v => !!v || 'Item is required']"
        :hint="`${(importType && importType.type) || 'Please first select the exporter'}`"
        label="Export type"
        persistent-hint
        required
        return-object
      )
      v-card-actions
        v-btn(
          :disabled="!importType.value || !importFile"
          @click="attemptExport"
          prepend-icon="mdi-export"
        ) Export
        v-btn(
          v-if="debugStore.active"
          :disabled="!importType.value"
          :to="`/migrate/tree/${importType.value}`"
        ) Show database mapping
</template>
<script>
import { useImportersStore } from '~/stores/importers'
import { useDebugStore } from '~/stores/debug'
import { ref } from 'vue'

export default {
  setup() {
    const importersStore = useImportersStore()
    const debugStore = useDebugStore()

    importersStore.fetchImporters()

    const importType = ref('')
    const importFile = ref([])

    return { 
      importersStore, debugStore,
      importType, importFile
    }
  },
  data:() => ({
    isImporting: false
  }),
  methods: {
    attemptExport() {
      this.isImporting = true
      const formData = new FormData()
      formData.append('importType', this.importType.value)
      formData.append('importFile', this.importFile[0])

      $fetch(
        `/api/import/process/${this.importType.value}`, 
        { 
          method: 'POST',
          body: formData,
        }
      ).then((status) => {
        console.log('fetch reached an end', status)
        // this.$refs.exportForm.trigger('reset')
        this.isImporting = false;
      })
    }
  }
}
</script>
    