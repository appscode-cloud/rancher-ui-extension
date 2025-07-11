<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";
import { useField } from "vee-validate";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Accordion from "@rancher/shell/rancher-components/Accordion/Accordion.vue";
import ToggleSwitch from "@rancher/shell/rancher-components/Form/ToggleSwitch/ToggleSwitch.vue";

interface Props {
  alertsList: string[];
  issuerList: string[];
  AdditionalToggleSwitch: {
    Monitoring: boolean;
    Backup: boolean;
    Archiver: boolean;
    TLS: boolean;
    Expose: boolean;
  };
}

const props = defineProps<Props>();
const isMonitoring = ref(false);
const isBackup = ref(false);
const isArchiver = ref(false);
const isTLS = ref(false);
const isExpose = ref(false);

const { value: alert } = useField<string>("alert");
const { value: issuer } = useField<string>("issuer");

const updateMonitoring = (value: boolean) => {
  isMonitoring.value = value;
};

const updateBackup = (value: boolean) => {
  isBackup.value = value;
};

const updateArchiver = (value: boolean) => {
  isArchiver.value = value;
};

const updateTLS = (value: boolean) => {
  isTLS.value = value;
};

const updateExpose = (value: boolean) => {
  isExpose.value = value;
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
