<template lang="pug">
a.d-none(
  ref="link"
  :href="href"
  :download="download"
) {{ href }} {{ download }}
</template>
<script setup>
import { ref, nextTick } from 'vue'
const href = ref({})
const download = ref({})

const link = ref(null)
const startDownload = (trgHref,trgDownload) => {
  href.value = trgHref
  download.value = trgDownload
  nextTick(() => { link.value.click() })
}
defineExpose({
  startDownload
})
</script>