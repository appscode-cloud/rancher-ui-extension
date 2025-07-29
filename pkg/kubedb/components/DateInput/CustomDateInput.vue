<template>
  <div>
    <label for="meeting-time">{{ label }}</label>
    <input
      type="datetime-local"
      id="meeting-time"
      name="meeting-time"
      :value="modelValue"
      @input="onInput"
      :required="props.required"
      :min="min"
      :max="max"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, withDefaults, defineEmits } from "vue";

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
  modelValue: "",
});

const emit = defineEmits(["update:modelValue"]);

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>

<style scoped>
label {
  display: block;
}

input,
label {
  margin: 0.4rem 0;
}
</style>
