<template>
  <div class="labeled-input edit mb-20">
    <label for="meeting-time">{{ label }} <span class="required">*</span></label>
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

<style lang="scss" scoped>
label {
  display: block;
}

input,
label {
  margin: 0.4rem 0;
}
.labeled-input {
  position: relative;
  display: inline-block;
  input[type="datetime-local"]{    
    color: var(--input-text);
    appearance: none;
    -webkit-appearance: none;
    padding-right: 36px; /* space for icon */
    font-size: 16px;
    border-radius: 4px;
    &::-webkit-calendar-picker-indicator {
      opacity: 0;
      cursor: pointer;
      position: absolute;
      right: 0;
    }
  }
  &::after {
    content: "📅"; 
    position: absolute;
    right: 10px;
    top: 38px; 
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 18px;
    color: crimson; 
  }
}

</style>
