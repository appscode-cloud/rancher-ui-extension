<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import BasicDbConfig from "../../components/BasicDbConfig.vue";
import AdvancedDbConfig from "../../components/AdvancedDbConfig.vue";
import AdditionalOptions from "../../components/AdditionalOptions.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";
import YamlEditor from "@rancher/shell/components/YamlEditor.vue";

import { useRequiredRule } from "../../composables/useRequiredRule";
import { useProps } from "./props";
import { useFunctions } from "./functions";

const { required } = useRequiredRule();
const {
  validate,
  values,
  errors,
  name,
  namespace,
  AdvancedToggleSwitch,
  AdditionalToggleSwitch,
  genericNameSpaces,
  genericVersions,
  genericName,
  genericStorageSize,
  genericStorageClass,
  genericDeletionPolicy,
  genericReplica,
  genericMachine,
  genericCPU,
  genericMemory,
  genericMode,
  genericLabels,
  genericAnnotations,
  genericDbConfiguration,
  genericPassword,
  genericSecret,
  genericStandbyMode,
  genericPitrNamespace,
  genericPitrName,
  genericStreamingMode,
  genericAlert,
  genericIssuer,
} = useProps();

const {
  getBundle,
  getSecrets,
  getValues,
  getNamespaces,
  isBundleLoading,
  isNamespaceLoading,
  isValuesLoading,
} = useFunctions();

const { params } = useRoute();
const cluster = params.cluster;
const DATABASE = "postgres";

const EDITOR_MODES = {
  EDIT_CODE: "EDIT_CODE",
  VIEW_CODE: "VIEW_CODE",
  DIFF_CODE: "DIFF_CODE",
};

const step = ref(1);
const disableNextBtn = ref(true);

const previewTitle = computed(() => {
  return `Create Postgres: ${namespace.value}/${name.value}`;
});

watch(values, async () => {
  await validate();
  const validated = Object.values(errors.value).every((value) => value === "");
  disableNextBtn.value = !validated;
});

watch(namespace, (n) => {
  getSecrets(n);
});

const gotoNext = () => {
  validate();
  if (step.value === 1) step.value = 2;
  else {
    // createPgInstance();
  }
};

const setNamespaces = async () => {
  const data = await getNamespaces();
  genericNameSpaces.value.options = data;
};

const setValues = async () => {
  const data = await getValues();

  //version
  const availableVersions =
    data?.values.spec.admin.databases.Postgres.versions.available || [];
  genericVersions.value.versionModel =
    data?.values.spec.admin.databases.Postgres.versions.default;
  if (availableVersions) {
    availableVersions.forEach((ele: string) => {
      genericVersions.value.options?.push({
        label: ele,
        value: ele,
      });
    });
  }

  //Storageclasses
  const availableStorageClass =
    data?.values.spec.admin.storageClasses.available || [];
  if (availableStorageClass) {
    availableStorageClass.forEach((ele: string) => {
      genericStorageClass.value.options?.push({ label: ele, value: ele });
    });
    if (availableStorageClass.length === 1) {
      genericStorageClass.value.storageClassModel = availableStorageClass[0];
    }
  }

  //ClusterIssuer
  const availableClusterIssuer =
    data?.values.spec.admin.clusterIssuers.available || [];
  if (availableClusterIssuer) {
    availableClusterIssuer.forEach((ele: string) => {
      genericIssuer.value.options?.push({ label: ele, value: ele });
    });
  }
};

const setBundle = async () => {
  const data = await getBundle();

  const availableClusterIssuer = data?.bundle.clusterissuers;
  const features = data?.bundle.features || [];
  if (features.includes("backup")) {
    AdditionalToggleSwitch.value.backup = true;
  }
  if (features.includes("tls")) {
    AdditionalToggleSwitch.value.tls = true;
  }
  if (features.includes("monitoring")) {
    AdditionalToggleSwitch.value.monitoring = true;
  }
  if (features.includes("binding")) {
    AdditionalToggleSwitch.value.expose = true;
  }

  const availableStorageClass = data?.bundle.storageclasses;
  if (availableStorageClass) {
    genericStorageClass.value.options = [];
    availableStorageClass.forEach((ele: string) => {
      genericStorageClass.value.options?.push({ label: ele, value: ele });
    });
    if (availableStorageClass.length === 1) {
      genericStorageClass.value.storageClassModel = availableStorageClass[0];
    }
  }

  if (availableClusterIssuer) {
    availableClusterIssuer.forEach((ele: string) => {
      genericIssuer.value.options?.push({ label: ele, value: ele });
    });
  }
};

onMounted(async () => {
  validate();
  setNamespaces();
  setValues();
  setBundle();
});
</script>

<template>
  <div class="m-20">
    <h1>{{ step === 1 ? "Create Postgres" : previewTitle }}</h1>
    <p v-if="isValuesLoading || isBundleLoading || isNamespaceLoading">
      loading...
    </p>
    <div v-else>
      <div v-if="step === 1">
        <!-- Basic Configuration Component -->
        <BasicDbConfig
          :genericNameSpaces="genericNameSpaces"
          :genericVersions="genericVersions"
          :genericName="genericName"
          :genericMode="genericMode"
          :required="required"
          :genericStorageSize="genericStorageSize"
          :genericStorageClass="genericStorageClass"
          :genericReplica="genericReplica"
          :genericMachine="genericMachine"
          :genericCPU="genericCPU"
          :genericMemory="genericMemory"
        />

        <AdvancedDbConfig
          :AdvancedToggleSwitch="AdvancedToggleSwitch"
          :genericDeletionPolicy="genericDeletionPolicy"
          :genericLabels="genericLabels"
          :genericAnnotations="genericAnnotations"
          :genericDbConfiguration="genericDbConfiguration"
          :genericPassword="genericPassword"
          :genericSecret="genericSecret"
          :genericStandbyMode="genericStandbyMode"
          :genericPitrNamespace="genericPitrNamespace"
          :genericPitrName="genericPitrName"
          :genericStreamingMode="genericStreamingMode"
          :required="required"
        />

        <AdditionalOptions
          :AdditionalToggleSwitch="AdditionalToggleSwitch"
          :genericAlert="genericAlert"
          :genericIssuer="genericIssuer"
        />
      </div>

      <YamlEditor
        v-if="step === 2"
        ref="yamleditor"
        v-model:value="values"
        mode="create"
        :asObject="true"
        :initial-yaml-values="values"
        class="yaml-editor flex-content"
        :editor-mode="EDITOR_MODES.EDIT_CODE"
        @update:value="console.log('write function to update ')"
      />
    </div>

    <div class="button-container">
      <RcButton secondary>Cancel</RcButton>
      <div>
        <RcButton
          v-if="step === 2"
          primary
          @click="step = 1"
          :disabled="disableNextBtn"
          >Previous</RcButton
        >
        <RcButton primary @click="gotoNext" :disabled="disableNextBtn">{{
          step === 1 ? "Preview" : "Deploy"
        }}</RcButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-between;
}
</style>
