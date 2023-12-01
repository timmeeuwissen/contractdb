<template lang="pug">
v-dialog(
  v-model="showLogin"
  close-on-content-click="true"
)
  login-component

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
      @click="link.click"
    ) {{ link.title }}
    v-col.text-center.mt-4(cols="12")
      | {{ new Date().getFullYear() }} — <strong>Tim Meeuwissen</strong>
</template>  
<script setup>
import LoginComponent from '~/components/login.vue'
const showLogin = ref(false)

const links = [
  {
    to: '/',
    title: 'About',
    click: undefined,
  },
  {
    to: '/plans',
    title: 'Plans',
    click: undefined,
  },
  {
    to: undefined,
    title: 'Login',
    click: () => {
      showLogin.value = !showLogin.value
    },
  }
]
</script>