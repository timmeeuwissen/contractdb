<template lang="pug">
v-app
  v-container(fill-height)
    v-row(justify="center")
      NuxtLayout(:name="layout")
        NuxtPage
</template>
<script setup>
const route = useRoute()
const layout = ref(undefined)

const determineLayout = () => {
  if (route.fullPath.match(/^\/TIM/)){
      layout.value = "tim"
    }
}

watch(
  () => route.fullPath,
  determineLayout
)

determineLayout()
</script>