<template lang="pug">
v-menu(
  :close-on-content-click="false"
  transition="scale-transition"
  offset-y
  min-width="290px"
  v-model="isOpen"
)
  template(v-slot:activator="menu")
    v-tooltip(bottom text="Select Date")
      template(v-slot:activator="tooltip")
        v-icon(v-bind="{...tooltip.props, ...menu.props}" color="grey-lighten-1") mdi-calendar
  v-date-picker(
    v-model="dateModel" 
    no-title 
    scrollable
    :min="min"
    :max="max"
    @click:cancel="isOpen = false"
    @click:save="isOpen = false"
  )
</template>
<script setup>
import { ref } from 'vue'
import { VDatePicker } from 'vuetify/labs/VDatePicker'

const isOpen = ref(false)

const props = defineProps(['modelValue', 'min', 'max'])
const emit = defineEmits(['update:modelValue'])

const dateModel = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script> 