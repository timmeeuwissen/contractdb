<template lang="pug">
ul.ml-4
  li(v-for="child, index in treeData" :key="child.title")
    v-btn(
      v-if="child.children && child.children.length"
      @click="toggle(index)"
      :icon="isOpened[index] ? 'mdi-chevron-down' : 'mdi-chevron-right'"
    )
    v-icon(
      v-if="iconMap && (child.type in iconMap)"
    ) {{ iconMap[child.type] }}
    span(
      @click="$emit('infoRequest', [child])"
    ) {{ child.title }}
    tree(
      v-if="isOpened[index]"
      v-on:info-request="(childResult) => $emit('infoRequest',[child, ...childResult])"
      :tree-data="child.children"
      :icon-map="iconMap"
    )
</template>
<script setup>
import tree from '~/components/tree.vue';
import { reactive } from 'vue'
defineProps(['treeData', 'iconMap'])
defineEmits(['toggle', 'infoRequest'])

const isOpened = reactive({})

const toggle = async (index) => {
  isOpened[index] = !isOpened[index]
}
</script>