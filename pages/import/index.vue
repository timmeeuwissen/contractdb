<template lang="pug">

//- in case we have importers, list them here. Importers can import over a multitude
//- of tables, there rules are defined in the config
v-col(cols="auto" v-if="Object.keys(importersStore.importers).length")
  v-form(
    @prevent.default="attemptImport"
    ref="importForm"
  )
    v-card
      v-card-title Importer 
      v-card-text
        v-select(
          v-model="importType"
          :items="importersStore.importers"
          item-title="title"
          item-value="value"
          :rules="[v => !!v || 'Item is required']"
          :hint="`${(importType && importType.type) || 'Please first select the importer'}`"
          label="Import type"
          persistent-hint
          required
          return-object
        )
        v-file-input(
          v-model="importFile"
          :accept="importType && importType.type"
          :disabled="!importType || !importType.type"
          label="File"
        )
        v-card-actions
          v-btn(
            :disabled="!importType.value || !importFile"
            color="success"
            @click="attemptImport"
          ) Attempt to import
          v-btn(
            v-if="debugStore.active"
            :disabled="!importType.value"
            color="success"
            :to="`/import/tree/${importType.value}`"
          ) Show import tree
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
    attemptImport() {
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
        // this.$refs.importForm.trigger('reset')
        this.isImporting = false;
      })
    }
  }
}
</script>
