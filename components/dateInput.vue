<template lang="pug">
div
  span.text-left.empty(v-if="!dateModel") No date selected
  span.text-left(v-else :set="dts = new Date(dateModel)") 
    //- | {{ dateModel }}
    | {{ dts.getDay() }} 
    | {{ months[dts.getMonth()] }} 
    | {{ dts.getFullYear() }}
  date-tooltip(v-model="dateModel" :min="min" :max="max")
</template>
<script setup>
import DateTooltip from './dateTooltip'
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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