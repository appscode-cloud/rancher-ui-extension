<script setup lang="ts">
import { defineProps, onScopeDispose, ref } from "vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Accordion from "@rancher/shell/rancher-components/Accordion/Accordion.vue";
import ToggleSwitch from "@rancher/shell/rancher-components/Form/ToggleSwitch/ToggleSwitch.vue";
import { genericAlertType, genericIssuerType } from "../types/type";

interface Props {
  AdditionalToggleSwitch: {
    Monitoring: boolean;
    Backup: boolean;
    Archiver: boolean;
    TLS: boolean;
    Expose: boolean;
  };
  genericAlert: genericAlertType;
  genericIssuer: genericIssuerType;
}

const props = defineProps<Props>();

const isMonitoring = ref(false);
const isBackup = ref(false);
const isArchiver = ref(false);
const isTLS = ref(false);
const isExpose = ref(false);
</script>

<template>
  <Accordion title="Additional Options" class="mb-20">
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.Monitoring"
      class="mb-20"
      v-model:value="isMonitoring"
      off-label="Enable Monitoring?"
    />
    <LabeledSelect
      v-if="isMonitoring && props.genericAlert.show"
      class="mb-20"
      v-model:value="props.genericAlert.alertModel"
      :options="props.genericAlert.options"
      :label="props.genericAlert.label"
    />
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.Backup"
      class="mb-20"
      v-model:value="isBackup"
      off-label="Enable Backup?"
    />
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.Archiver"
      class="mb-20"
      v-model:value="isArchiver"
      off-label="Enable Archiver?"
    />
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.TLS"
      class="mb-20"
      v-model:value="isTLS"
      off-label="Enable TLS?"
    />
    <LabeledSelect
      v-if="isTLS && props.genericIssuer.show"
      class="mb-20"
      v-model:value="props.genericIssuer.issuerModel"
      :options="props.genericIssuer.options"
      :label="props.genericIssuer.label"
    />
    <ToggleSwitch
      v-if="props.AdditionalToggleSwitch?.Expose"
      class="mb-20"
      v-model:value="isExpose"
      off-label="Expose via Gateway ?"
    />
  </Accordion>
</template>