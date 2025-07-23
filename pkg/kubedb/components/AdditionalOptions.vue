<script setup lang="ts">
import { computed, defineProps } from "vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Accordion from "@rancher/shell/rancher-components/Accordion/Accordion.vue";
import ToggleSwitch from "@rancher/shell/rancher-components/Form/ToggleSwitch/ToggleSwitch.vue";
import {
  AlertType,
  ArchiverType,
  BackupType,
  ExposeType,
  IssuerType,
  MonitoringType,
  TLSType,
} from "../types/types";

interface Props {
  MonitoringProps: MonitoringType;
  BackupProps: BackupType;
  ArchiverProps: ArchiverType;
  TLSProps: TLSType;
  ExposeProps: ExposeType;
  AlertProps: AlertType;
  IssuerProps: IssuerType;
}

const props = defineProps<Props>();

const monitoringModel = computed({
  get: () => props.MonitoringProps?.monitoringModel,
  set: (val) => {
    if (props.MonitoringProps) {
      props.MonitoringProps.monitoringModel = val;
    }
  },
});

const alertModel = computed({
  get: () => props.AlertProps?.alertModel,
  set: (val) => {
    if (props.AlertProps) {
      props.AlertProps.alertModel = val;
    }
  },
});

const backupModel = computed({
  get: () => props.BackupProps?.backupModel,
  set: (val) => {
    if (props.BackupProps) {
      props.BackupProps.backupModel = val;
    }
  },
});

const archiverModel = computed({
  get: () => props.ArchiverProps?.archiverModel,
  set: (val) => {
    if (props.ArchiverProps) {
      props.ArchiverProps.archiverModel = val;
    }
  },
});

const tlsModel = computed({
  get: () => props.TLSProps?.tlsModel,
  set: (val) => {
    if (props.TLSProps) {
      props.TLSProps.tlsModel = val;
    }
  },
});

const issuerModel = computed({
  get: () => props.IssuerProps?.issuerModel,
  set: (val) => {
    if (props.IssuerProps) {
      props.IssuerProps.issuerModel = val;
    }
  },
});

const exposeModel = computed({
  get: () => props.ExposeProps?.exposeModel,
  set: (val) => {
    if (props.ExposeProps) {
      props.ExposeProps.exposeModel = val;
    }
  },
});

const showAlert = computed(() => {
  return props.MonitoringProps?.monitoringModel && props.AlertProps?.show;
});

const showClusterIssuer = computed(() => {
  return props.TLSProps?.tlsModel && props.IssuerProps?.show;
});
</script>

<template>
  <Accordion title="Additional Options" class="mb-20">
    <ToggleSwitch
      v-if="props.MonitoringProps?.show"
      class="mb-20"
      v-model:value="monitoringModel"
      off-label="Enable Monitoring?"
    />

    <LabeledSelect
      v-if="showAlert"
      class="mb-20"
      v-model:value="alertModel"
      :options="props.AlertProps.options"
      :label="props.AlertProps.label"
      :required="showAlert"
      :rules="props.AlertProps.rules"
    />

    <ToggleSwitch
      v-if="props.BackupProps?.show"
      class="mb-20"
      v-model:value="backupModel"
      off-label="Enable Backup?"
    />

    <ToggleSwitch
      v-if="props.ArchiverProps?.show"
      class="mb-20"
      v-model:value="archiverModel"
      off-label="Enable Archiver?"
    />

    <ToggleSwitch
      v-if="props.TLSProps?.show"
      class="mb-20"
      v-model:value="tlsModel"
      off-label="Enable TLS?"
    />

    <LabeledSelect
      v-if="showClusterIssuer"
      class="mb-20"
      v-model:value="issuerModel"
      :options="props.IssuerProps.options"
      :label="props.IssuerProps.label"
      :required="showClusterIssuer"
      :rules="props.IssuerProps.rules"
    />

    <ToggleSwitch
      v-if="props.ExposeProps?.show"
      class="mb-20"
      v-model:value="exposeModel"
      off-label="Expose via Gateway?"
    />
  </Accordion>
</template>
