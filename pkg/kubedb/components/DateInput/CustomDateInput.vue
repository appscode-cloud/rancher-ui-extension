<template>
  <label for="meeting-time">{{ label }}</label>

  <input
    type="datetime-local"
    id="meeting-time"
    name="meeting-time"
    :value="formattedValue"
    @input="handleInput"
    min="2018-06-07T00:00"
    max="2018-06-14T00:00" 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: Date | string | null;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: Array<(value: any) => string | boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select date',
  required: false,
  disabled: false,
  label: 'Choose a time for your appointment:',
  rules: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: string | Date | null]
}>();

const formattedValue = computed(() => {
  if (!props.modelValue) return '';
  
  if (props.modelValue instanceof Date) {
    return props.modelValue.toISOString().slice(0, 16);
  }
  
  if (typeof props.modelValue === 'string') {
    const date = new Date(props.modelValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 16);
    }
    return props.modelValue;
  }
  return '';
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  
  if (value) {
    emit('update:modelValue', value);
  } else {
    emit('update:modelValue', null);
  }
};
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