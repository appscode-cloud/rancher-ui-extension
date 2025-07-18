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
import Tabbed from "@shell/components/Tabbed/index.vue";
import Tab from "@shell/components/Tabbed/Tab.vue";

import { useUtils } from "../../composables/utils";
import { useRules } from "../../composables/rules";
import { useProps } from "./props";
import { useFunctions } from "./functions";

const EDITOR_MODES = {
  EDIT_CODE: "EDIT_CODE",
  VIEW_CODE: "VIEW_CODE",
  DIFF_CODE: "DIFF_CODE",
};

const store = useStore();
const { required } = useRules();
const { params } = useRoute();
const { yamlToJs } = useUtils();

const {
  validate,
  values,
  errors,
  name,
  namespace,
  AdvancedToggleSwitch,
  NameSpacesProps,
  VersionsProps,
  NameProps,
  StorageSizeProps,
  StorageClassProps,
  DeletionPolicyProps,
  ReplicaProps,
  MachineProps,
  CPUProps,
  MemoryProps,
  ModeProps,
  LabelsProps,
  AnnotationsProps,
  DbConfigurationProps,
  AuthPasswordProps,
  AuthSecretProps,
  StandbyModeProps,
  PitrNamespaceProps,
  PitrNameProps,
  StreamingModeProps,
  AlertProps,
  IssuerProps,
  MonitoringProps,
  BackupProps,
  ArchiverProps,
  TLSProps,
  ExposeProps,
  RemoteReplicaProps,
} = useProps();

const {
  getBundle,
  getAuthSecrets,
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
  NameSpacesProps.value.options = data;
};

const setValues = async () => {
  const data = await getValues(clusterName.value, namespace.value);

  modelApiPayload.value = data?.values;

  const availableVersions =
    data?.values.spec.admin.databases.Postgres.versions.available || [];
  VersionsProps.value.versionModel =
    data?.values.spec.admin.databases.Postgres.versions.default;
  if (availableVersions) {
    availableVersions.forEach((ele: string) => {
      VersionsProps.value.options?.push({
        label: ele,
        value: ele,
      });
    });
  }

  const availableStorageClass =
    data?.values.spec.admin.storageClasses.available || [];
  if (availableStorageClass) {
    availableStorageClass.forEach((ele: string) => {
      StorageClassProps.value.options?.push({ label: ele, value: ele });
    });
    if (availableStorageClass.length === 1) {
      StorageClassProps.value.storageClassModel = availableStorageClass[0];
    }
  }

  const availableClusterIssuer =
    data?.values.spec.admin.clusterIssuers.available || [];
  if (availableClusterIssuer) {
    availableClusterIssuer.forEach((ele: string) => {
      IssuerProps.value.options?.push({ label: ele, value: ele });
    });
  }
};

const setBundle = async () => {
  const data = await getBundle(clusterName.value);

  const availableClusterIssuer = data?.bundle.clusterissuers;
  const features = data?.bundle.features || [];
  if (features.includes("backup")) {
    BackupProps.value.show = true;
  }
  if (features.includes("tls")) {
    TLSProps.value.show = true;
  }
  if (features.includes("monitoring")) {
    MonitoringProps.value.show = true;
  }
  if (features.includes("binding")) {
    ExposeProps.value.show = true;
  }

  const availableStorageClass = data?.bundle.storageclasses;
  if (availableStorageClass) {
    StorageClassProps.value.options = [];
    availableStorageClass.forEach((ele: string) => {
      StorageClassProps.value.options?.push({ label: ele, value: ele });
    });
    if (availableStorageClass.length === 1) {
      StorageClassProps.value.storageClassModel = availableStorageClass[0];
    }
  }

  if (availableClusterIssuer) {
    availableClusterIssuer.forEach((ele: string) => {
      IssuerProps.value.options?.push({ label: ele, value: ele });
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
  getAuthSecrets(n, clusterName.value);
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
          v-if="NameSpacesProps.show"
          v-model:value="NameSpacesProps.namespaceModel"
          :clearable="NameSpacesProps.clearable"
          :options="NameSpacesProps.options"
          :disabled="NameSpacesProps.disabled"
          :searchable="NameSpacesProps.searchable"
          :multiple="NameSpacesProps.multiple"
          :label="NameSpacesProps.label"
          :placeholder="NameSpacesProps.placeholder"
          :required="NameSpacesProps.required"
          :rules="NameSpacesProps.rules"
        />
      </div>

      <div class="col span-6">
        <LabeledInput
          v-if="NameProps.show"
          v-model:value="NameProps.nameModel"
          :label="NameProps.label"
          :placeholder="NameProps.placeholder"
          :disabled="NameProps.disabled"
          :min-height="NameProps.minHeight"
          :required="NameProps.required"
          :rules="NameProps.rules"
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
            :NameSpacesProps="NameSpacesProps"
            :VersionsProps="VersionsProps"
            :NameProps="NameProps"
            :ModeProps="ModeProps"
            :required="required"
            :StorageSizeProps="StorageSizeProps"
            :StorageClassProps="StorageClassProps"
            :ReplicaProps="ReplicaProps"
            :MachineProps="MachineProps"
            :CPUProps="CPUProps"
            :MemoryProps="MemoryProps"
            :RemoteReplicaProps="RemoteReplicaProps"
          />

          <AdvancedDbConfig
            :AdvancedToggleSwitch="AdvancedToggleSwitch"
            :DeletionPolicyProps="DeletionPolicyProps"
            :LabelsProps="LabelsProps"
            :AnnotationsProps="AnnotationsProps"
            :DbConfigurationProps="DbConfigurationProps"
            :AuthPasswordProps="AuthPasswordProps"
            :AuthSecretProps="AuthSecretProps"
            :StandbyModeProps="StandbyModeProps"
            :PitrNamespaceProps="PitrNamespaceProps"
            :PitrNameProps="PitrNameProps"
            :StreamingModeProps="StreamingModeProps"
            :required="required"
          />

          <AdditionalOptions
            :MonitoringProps="MonitoringProps"
            :BackupProps="BackupProps"
            :ArchiverProps="ArchiverProps"
            :TLSProps="TLSProps"
            :ExposeProps="ExposeProps"
            :AlertProps="AlertProps"
            :IssuerProps="IssuerProps"
          />
        </div>
      </div>
    </div>
    <div v-if="step === 3">
      <Tabbed class="mb-20" default-tab="overview" :use-hash="true">
        <Tab
          v-for="file in previewFiles"
          :key="file.key"
          :name="file.filename"
          :label="file.filename"
          :weight="2"
          :badge="0"
          :error="false"
        >
          <div class="tab-content">
            <YamlEditor
              ref="yamleditor"
              v-model:value="file.data"
              mode="create"
              :asObject="false"
              :initial-yaml-values="file.data"
              class="yaml-editor flex-content"
              :editor-mode="EDITOR_MODES.EDIT_CODE"
            />
          </div>
        </Tab>
      </Tabbed>
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
