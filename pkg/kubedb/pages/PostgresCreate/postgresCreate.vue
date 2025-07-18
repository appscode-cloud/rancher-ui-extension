<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import BasicDbConfig from "../../components/BasicDbConfig.vue";
import AdvancedDbConfig from "../../components/AdvancedDbConfig.vue";
import AdditionalOptions from "../../components/AdditionalOptions.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";
import YamlEditor from "@rancher/shell/components/YamlEditor.vue";

import { useUtils } from "../../composables/utils";
import { useRules } from "../../composables/rules";
import { useProps } from "./props";
import { useFunctions } from "./functions";

const EDITOR_MODES = {
  EDIT_CODE: "EDIT_CODE",
  VIEW_CODE: "VIEW_CODE",
  DIFF_CODE: "DIFF_CODE",
};

const { required } = useRules();
const store = useStore();
const { params } = useRoute();
const { yamlToJs } = useUtils();

const {
  validate,
  values,
  errors,
  name,
  namespace,
  AdvancedToggleSwitch,
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
  genericauthPassword,
  genericauthSecret,
  genericStandbyMode,
  genericPitrNamespace,
  genericPitrName,
  genericStreamingMode,
  genericAlert,
  genericIssuer,
  genericMonitoring,
  genericBackup,
  genericArchiver,
  genericTlS,
  genericExpose,
} = useProps();

const {
  getBundle,
  getauthSecrets,
  getValues,
  getNamespaces,
  modelApiCall,
  generateModelPayload,
  resourceSkipCRDApiCall,
  deployCall,
  isDeploying,
  isModelLoading,
  isResourceSkipLoading,
  isBundleLoading,
  isNamespaceLoading,
  isValuesLoading,
} = useFunctions();

const step = ref(1);
const clusterName = ref("");
const modelApiPayload = ref({});
const resourceSkipPayload = ref();
const disableNextBtn = ref(true);

const previewTitle = computed(() => {
  return step.value === 1
    ? "Create Postgres"
    : `Create Postgres: ${namespace.value}/${name.value}`;
});

const getClusters = async () => {
  try {
    const result = await store.dispatch("management/findAll", {
      type: "management.cattle.io.cluster",
    });
    result.forEach((ele: { id: string; spec: { displayName: string } }) => {
      if (ele.id === params.cluster) {
        clusterName.value = ele.spec.displayName;
      }
    });
  } catch (e) {
    console.log(e);
  }
};

const setNamespaces = async () => {
  const data = await getNamespaces(clusterName.value);
  genericNameSpaces.value.options = data;
};

const setValues = async () => {
  const data = await getValues(clusterName.value, namespace.value);

  modelApiPayload.value = data?.values;

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
  const data = await getBundle(clusterName.value);

  const availableClusterIssuer = data?.bundle.clusterissuers;
  const features = data?.bundle.features || [];
  if (features.includes("backup")) {
    genericBackup.value.show = true;
  }
  if (features.includes("tls")) {
    genericTlS.value.show = true;
  }
  if (features.includes("monitoring")) {
    genericMonitoring.value.show = true;
  }
  if (features.includes("binding")) {
    genericExpose.value.show = true;
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

watch(values, async () => {
  if (namespace.value && modelApiPayload.value && name.value)
    modelApiPayload.value = generateModelPayload(values, modelApiPayload.value);
  await validate();
  const validated = Object.values(errors.value).every((value) => value === "");
  disableNextBtn.value = !validated;
});

watch(namespace, (n) => {
  getauthSecrets(n, clusterName.value);
  setValues();
});

onMounted(async () => {
  await getClusters();
  validate();
  setNamespaces();
  setValues();
  setBundle();
});

const previewFiles = ref<
  Array<{ key: string; filename: string; data: string }>
>([]);

const gotoNext = async () => {
  if (step.value === 1) step.value = 2;
  else if (step.value === 2) {
    resourceSkipPayload.value = await modelApiCall(
      clusterName.value,
      modelApiPayload.value
    );

    const resourceSkipCRDResponse = await resourceSkipCRDApiCall(
      clusterName.value,
      resourceSkipPayload.value?.values
    );

    previewFiles.value = resourceSkipCRDResponse?.values.resources;
    step.value = 3;
  } else if (step.value === 3) {
    const deployApiPayload: {
      form: Record<string, any>;
      metadata: Record<string, any>;
      resources: Record<string, any>;
    } = {
      form: {},
      metadata: {},
      resources: {},
    };
    deployApiPayload.form = resourceSkipPayload.value.values.form;
    deployApiPayload.metadata = resourceSkipPayload.value.values.metadata;
    previewFiles.value.forEach(
      (file: { key: string; filename: string; data: string }) => {
        deployApiPayload.resources[file.key] = yamlToJs(file.data);
      }
    );
    deployCall(clusterName.value, deployApiPayload);
  }
};
</script>

<template>
  <div class="m-24">
    <h1>{{ previewTitle }}</h1>
    <div class="mb-20" v-if="step === 1">
      <div class="col span-6 mb-20">
        <LabeledSelect
          v-if="genericNameSpaces.show"
          v-model:value="genericNameSpaces.namespaceModel"
          :clearable="genericNameSpaces.clearable"
          :options="genericNameSpaces.options"
          :disabled="genericNameSpaces.disabled"
          :searchable="genericNameSpaces.searchable"
          :multiple="genericNameSpaces.multiple"
          :label="genericNameSpaces.label"
          :placeholder="genericNameSpaces.placeholder"
          :required="genericNameSpaces.required"
          :rules="genericNameSpaces.rules"
        />
      </div>

      <div class="col span-6">
        <LabeledInput
          v-if="genericName.show"
          v-model:value="genericName.nameModel"
          :label="genericName.label"
          :placeholder="genericName.placeholder"
          :disabled="genericName.disabled"
          :min-height="genericName.minHeight"
          :required="genericName.required"
          :rules="genericName.rules"
        />
      </div>
    </div>
    <div v-if="step === 2">
      <p
        v-if="
          isValuesLoading ||
          isBundleLoading ||
          isNamespaceLoading ||
          isModelLoading ||
          isResourceSkipLoading
        "
      >
        loading...
      </p>
      <div v-else>
        <div>
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
            :genericauthPassword="genericauthPassword"
            :genericauthSecret="genericauthSecret"
            :genericStandbyMode="genericStandbyMode"
            :genericPitrNamespace="genericPitrNamespace"
            :genericPitrName="genericPitrName"
            :genericStreamingMode="genericStreamingMode"
            :required="required"
          />

          <AdditionalOptions
            :generic-monitoring="genericMonitoring"
            :generic-backup="genericBackup"
            :generic-archiver="genericArchiver"
            :generic-t-l-s="genericTlS"
            :generic-expose="genericExpose"
            :genericAlert="genericAlert"
            :genericIssuer="genericIssuer"
          />
        </div>
      </div>
    </div>
    <div v-if="step === 3">
      <div v-for="file in previewFiles" :key="file.key">
        <p>{{ file.filename }}</p>
        <YamlEditor
          ref="yamleditor"
          v-model:value="file.data"
          mode="create"
          :asObject="false"
          :initial-yaml-values="file.data"
          class="yaml-editor flex-content"
          :editor-mode="EDITOR_MODES.EDIT_CODE"
          @update:value="console.log('write function to update ')"
        />
      </div>
    </div>
    <div class="button-container">
      <RcButton secondary>Cancel</RcButton>
      <div>
        <RcButton
          v-if="step > 1"
          primary
          @click="step--"
          :disabled="disableNextBtn"
          >Previous</RcButton
        >
        <RcButton
          primary
          @click="gotoNext"
          :disabled="
            disableNextBtn ||
            isValuesLoading ||
            isDeploying ||
            isModelLoading ||
            isResourceSkipLoading ||
            isBundleLoading ||
            isNamespaceLoading ||
            isValuesLoading
          "
          >{{
            step === 1 ? "Next" : step === 2 ? "Preview" : "Deploy"
          }}</RcButton
        >
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
