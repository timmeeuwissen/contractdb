<template lang="pug">
v-card.mx-auto.pa-12.pb-8.mt-8.mb-8(
  elevation="8"
  max-width="448"
  rounded="lg"
 )
  div.text-subtitle-1.text-medium-emphasis Log in
    v-text-field(
      density="compact"
      placeholder="Database address"
      prepend-inner-icon="mdi-database"
      variant="outlined"
    )
    v-text-field(
      density="compact"
      placeholder="Username"
      prepend-inner-icon="mdi-account-outline"
      variant="outlined"
    )
    v-text-field(
      :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
      :type="visible ? 'text' : 'password'"
      density="compact"
      placeholder="Enter your password"
      prepend-inner-icon="mdi-lock-outline"
      variant="outlined"
      @click:append-inner="visible = !visible"
    )
      
    v-card(
      class="mb-6"
      color="surface-variant"
      variant="tonal"
    )  
      v-card-text.text-medium-emphasis.text-caption
        | Please make sure that your connection and your browser are secure.
        | You are connecting with your database credentials.

    v-card(
      class="mb-6"
      color="success"
      variant="tonal"
    )  
      v-card-text.text-medium-emphasis.text-caption
        | Have no account? No worries! Just connect with your database. <strong>We do not 
        | store any of your data on our servers</strong>. The credentials you enter are temporarily 
        | and securely stored in your browser. 

    v-btn(
      block
      class="mb-8"
      color="blue"
      size="large"
      variant="tonal"
    ) Log In

</template>
<script setup>
import { useAuthenticationStore } from '~/stores/authentication';
const authenticationStore = useAuthenticationStore()
const visible = ref(false)
</script>