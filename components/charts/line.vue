<template lang="pug">
line-chart(
  :data="props.data"
  :xkey="props.graphConfig.xKey"
)
</template>
<script setup>
import {LineChart} from 'vue-morris'
const props = defineProps(['graphConfig', 'data'])
</script>