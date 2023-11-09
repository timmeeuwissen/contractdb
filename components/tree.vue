<template lang="pug">
ul.ml-7
  li(v-for="(child, index) in treeData" :key="child.title")
    v-icon(
      v-if="iconMap && (child.type in iconMap)"
      @click="toggle(index)"
    ) {{ iconMap[child.type] }}
    v-btn(
      v-if="child.children && child.children.length"
      @click="toggle(index)"
      density="compact" variant="plain"
      :icon="isOpened[index] ? 'mdi-chevron-down' : 'mdi-chevron-right'"
    )
    span.getInfo.pl-2(
      @click="$emit('infoRequest', [{...child, index}])"
    ) {{ child.title }}
    tree(
      v-if="isOpened[index]"
      v-on:info-request="(childResult) => $emit('infoRequest',[{...child, index}, ...childResult])"
      :tree-data="child.children"
      :icon-map="iconMap"
      :openedPath="openDeeper"
    )
</template>
<script setup>
import tree from '~/components/tree.vue';
import { reactive, computed } from 'vue'
const props = defineProps({
  treeData: Object, 
  iconMap: Object, 
  openedPath: Array
})

const emit = defineEmits(['toggle', 'infoRequest'])

const isOpened = reactive({})

const toggle = async (index, state = undefined) => {
  isOpened[index] = (state !== undefined) ? state : !isOpened[index]
}

const openDeeper = ref([])
const updateProps = (props) => {
  if (Array.isArray(props.openedPath) && props.openedPath.length) {
    const [openIdx, ...rest] = Object.values(props.openedPath)
    toggle(openIdx, true)
    rest.forEach((v,i) => openDeeper.value[i] = v)
    if (!rest.length){
      emit('infoRequest', [{...props.treeData[openIdx], openIdx}])
    }
  }
  return openDeeper.value = []
}

updateProps(props)
watch(props, (newVal) => {newVal && updateProps(newVal)})

</script>
<style lang="sass" scoped>
ul
  list-style: none

  li
    list-style: none

    .getInfo
      cursor: pointer
</style>