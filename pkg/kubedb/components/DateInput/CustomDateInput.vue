<template>
  <label for="meeting-time">{{ label }}</label>
  <input
    type="datetime-local"
    id="meeting-time"
    name="meeting-time"
    :value="modelValue"
    @input="onInput"
    :min="min"
    :max="max"
    :placeholder="placeholder"
  />
</template>

<script setup lang="ts">
import { defineProps, withDefaults, defineEmits } from 'vue';

interface Props {
  modelValue?: string | null;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: Array<(value: any) => string | boolean>;
  min?: string;
  max?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '2018-06-12T19:30',
  placeholder: 'Select date',
  required: false,
  disabled: false,
  label: 'Choose a time for your appointment:',
  rules: () => [],
  min: '2018-06-07T00:00',
  max: '2018-06-14T00:00'
});

const emit = defineEmits(['update:modelValue']);

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<style scoped>
label {
  display: block;
  font: 1rem "Fira Sans", sans-serif;
}

input,
label {
  margin: 0.4rem 0;
}
</style>
