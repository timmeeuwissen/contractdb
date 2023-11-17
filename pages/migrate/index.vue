<template lang="pug">
import-component
export-component
queryables-component(
  title="Download a queryable into a CSV"
  @clicked:queryable="startDownload"
)
download-component(
  ref="download"
)
</template>
<script setup>
import {ref} from 'vue'

import ImportComponent from '~/components/migrate/import'
import ExportComponent from '~/components/migrate/export'
import QueryablesComponent from '~/components/database/queryables.vue';
import DownloadComponent from '~/components/download'

const download = ref(null)

const startDownload = (e) => {
  const format = e.format || 'CSV'

  download.value.startDownload(
    `/api/export/${e.type}/${e.target}?format=${format}`,
    `${e.target}.${(new Date()).toISOString().split('T')[0]}.${format.toLowerCase()}`
  )
  
}
</script>