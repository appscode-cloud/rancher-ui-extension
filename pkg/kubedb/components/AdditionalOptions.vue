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
} from "../types/type";

interface Props {
  genericMonitoring: MonitoringType;
  genericBackup: BackupType;
  genericArchiver: ArchiverType;
  genericTLS: TLSType;
  genericExpose: ExposeType;
  genericAlert: AlertType;
  genericIssuer: IssuerType;
}

const props = defineProps<Props>();

const monitoringModel = computed({
  get: () => props.genericMonitoring?.monitoringModel,
  set: (val) => {
    if (props.genericMonitoring) {
      props.genericMonitoring.monitoringModel = val;
    }
  },
});

const backupModel = computed({
  get: () => props.genericBackup?.backupModel,
  set: (val) => {
    if (props.genericBackup) {
      props.genericBackup.backupModel = val;
    }
  },
});

const archiverModel = computed({
  get: () => props.genericArchiver?.archiverModel,
  set: (val) => {
    if (props.genericArchiver) {
      props.genericArchiver.archiverModel = val;
    }
  },
});

const tlsModel = computed({
  get: () => props.genericTLS?.tlsModel,
  set: (val) => {
    if (props.genericTLS) {
      props.genericTLS.tlsModel = val;
    }
  },
});

const exposeModel = computed({
  get: () => props.genericExpose?.exposeModel,
  set: (val) => {
    if (props.genericExpose) {
      props.genericExpose.exposeModel = val;
    }
  },
});
</script>

<template>
  <Accordion title="Additional Options" class="mb-20">
    <ToggleSwitch
      v-if="props.genericMonitoring?.show"
      class="mb-20"
      v-model:value="monitoringModel"
      off-label="Enable Monitoring?"
    />
    <LabeledSelect
      v-if="props.genericMonitoring?.monitoringModel && props.genericAlert.show"
      class="mb-20"
      v-model:value="props.genericAlert.alertModel"
      :options="props.genericAlert.options"
      :label="props.genericAlert.label"
    />

    <ToggleSwitch
      v-if="props.genericBackup?.show"
      class="mb-20"
      v-model:value="backupModel"
      off-label="Enable Backup?"
    />
    <ToggleSwitch
      v-if="props.genericArchiver?.show"
      class="mb-20"
      v-model:value="archiverModel"
      off-label="Enable Archiver?"
    />
    <ToggleSwitch
      v-if="props.genericTLS?.show"
      class="mb-20"
      v-model:value="tlsModel"
      off-label="Enable TLS?"
    />
    <LabeledSelect
      v-if="props.genericTLS?.tlsModel && props.genericIssuer.show"
      class="mb-20"
      v-model:value="props.genericIssuer.issuerModel"
      :options="props.genericIssuer.options"
      :label="props.genericIssuer.label"
    />
    <ToggleSwitch
      v-if="props.genericExpose?.show"
      class="mb-20"
      v-model:value="exposeModel"
      off-label="Expose via Gateway ?"
    />
  </Accordion>
</template>
