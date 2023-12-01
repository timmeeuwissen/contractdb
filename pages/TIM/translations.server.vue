<template lang="pug">
v-card(width="950") 
  v-card-title Language
  v-card-text
    pre {{ JSON.stringify(config, null, 2) }}
</template>
<script>
import config from '~/config.json'
</script>