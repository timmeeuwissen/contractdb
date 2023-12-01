// import { useAuthStore } from '../stores';

export default defineNuxtRouteMiddleware(async (to) => {
  // const authStore = useAuthStore();

  return

  if (to.name !== 'Login') {
    if (!localStorage.getItem('auth-token')) {
      return navigateTo('/login');
    } 
    if (!authStore.user) {
      authStore.setAuthUser(await $fetch('/api/authentication', {
        headers: authHeader,
      }));
    }
  }
});
