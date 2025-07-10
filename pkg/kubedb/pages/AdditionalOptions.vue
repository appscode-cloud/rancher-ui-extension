<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import { useField } from "vee-validate";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Accordion from "@rancher/shell/rancher-components/Accordion/Accordion.vue";
import ToggleSwitch from "@rancher/shell/rancher-components/Form/ToggleSwitch/ToggleSwitch.vue";

interface Props {
  alertsList: string[];
  issuerList: string[];
  isMonitoring: boolean;
  isBackup: boolean;
  isArchiver: boolean;
  isTLS: boolean;
  isExpose: boolean;
  AdditionalToggleSwitch: {
    Monitoring: boolean;
    Backup: boolean;
    Archiver: boolean;
    TLS: boolean;
    Expose: boolean;
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:isMonitoring': [value: boolean];
  'update:isBackup': [value: boolean];
  'update:isArchiver': [value: boolean];
  'update:isTLS': [value: boolean];
  'update:isExpose': [value: boolean];
}>();

const { value: alert } = useField<string>("alert");
const { value: issuer } = useField<string>("issuer");

const updateMonitoring = () => {
  emit('update:isMonitoring', !props.isMonitoring);
};

const updateBackup = () => {
  emit('update:isBackup', !props.isBackup);
};

const updateArchiver = () => {
  emit('update:isArchiver', !props.isArchiver);
};

const updateTLS = () => {
  emit('update:isTLS', !props.isTLS);
};

const updateExpose = () => {
  emit('update:isExpose', !props.isExpose);
};

</script>

<template>
  <Accordion title="Additional Options" class="mb-20">
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.Monitoring" 
      class="mb-20"
      :value="isMonitoring"
      off-label="Enable Monitoring?"
      @update:value="updateMonitoring"
    />
    <LabeledSelect
      v-if="isMonitoring"
      class="mb-20"
      v-model:value="alert"
      :options="alertsList"
      label="Alert Options"
    />
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.Backup"
      class="mb-20"
      :value="isBackup"
      off-label="Enable Backup?"
      @update:value="updateBackup"
    />
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.Archiver"
      class="mb-20"
      :value="isArchiver"
      off-label="Enable Archiver?"
      @update:value="updateArchiver"
    />
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.TLS"
      class="mb-20"
      :value="isTLS"
      off-label="Enable TLS?"
      @update:value="updateTLS"
    />
    <LabeledSelect
      v-if="isTLS"
      class="mb-20"
      v-model:value="issuer"
      :options="issuerList"
      label="Cluster Issuers"
    />
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.Expose"
      class="mb-20"
      :value="isExpose"
      off-label="Expose via Gateway ?"
      @update:value="updateExpose"
    />
  </Accordion>
</template>