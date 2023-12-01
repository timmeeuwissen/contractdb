<template lang="pug">
v-main
  slot
v-footer.bg-grey-lighten-1
  v-row(justify="center" no-gutters)
    v-btn(
      v-for="link, idx in links"
      :key="idx"
      color="white"
      variant="text"
      class="mx-2"
      rounded="xl"
      :to="link.to"
    ) {{ link.title }}
    v-col.text-center.mt-4(cols="12")
      | {{ new Date().getFullYear() }} — <strong>Tim Meeuwissen</strong>
</template>  
<script setup>
const links = [
  {
    to: '/',
    title: 'About',
  },
  {
    to: '/plans',
    title: 'Plans',
  },
  {
    to: '/login',
    title: 'Login',
  }
]
</script>