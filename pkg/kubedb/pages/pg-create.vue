<script setup lang="ts">
import BasicDbConfig from "./BasicDbConfig.vue";
import AdvancedDbConfig from "./AdvancedDbConfig.vue";
import AdditionalOptions from "./AdditionalOptions.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useForm, useField } from "vee-validate";
import { useStore } from "vuex";
import $axios from "../composables/axios";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";
import YamlEditor from "@rancher/shell/components/YamlEditor.vue";
import { useRequiredRule } from "../composables/useRequiredRule";
const { required } = useRequiredRule();

const EDITOR_MODES = {
  EDIT_CODE: "EDIT_CODE",
  VIEW_CODE: "VIEW_CODE",
  DIFF_CODE: "DIFF_CODE",
};

type KubeResource = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    annotations?: Record<string, string>;
    labels?: Record<string, string>;
  };
  spec: {
    deletionPolicy: string;
    storage: {
      accessModes: string[];
      resources: {
        requests: {
          storage: string;
        };
      };
      storageClassName: string;
    };
    storageType: string;
    version: string;
  };
};

const store = useStore();
const pgList = ref<
  Array<{
    metadata: { name: string; namespace: string };
    spec: Record<string, any>;
  }>
>([]);

const step = ref(1);
const disableNextBtn = ref(true);
const clusterIdList = ref([]);

const { values, errors, validate, isValidating } = useForm({});
const { value: clusterId } = useField<string>("clusterId", required);
const { value: name } = useField<string>("name", required);
const { value: namespace } = useField<string>("namespace", required);
const { value: version } = useField<string>("version", required);
const { value: replicas } = useField<string>("replicas");
const { value: machine } = useField<string>("machine", required);
const { value: cpu } = useField<string>("cpu");
const { value: memory } = useField<string>("memory");
const { value: storageClass } = useField<string>("storageClass", required);
const { value: storageSize } = useField<string>("storageSize", required);
const { value: deletionPolicy } = useField<string>("deletionPolicy", required);
const { value: dbConfiguration } = useField<string>("dbConfiguration");
const { value: password } = useField<string>("password");
const { value: secret } = useField<string>("secret");
const { value: standbyMode } = useField<string>("standbyMode");
const { value: pitrNamespace } = useField<string>("pitrNamespace");
const { value: pitrName } = useField<string>("pitrName");
const { value: alert } = useField<string>("alert");
const { value: streamingMode } = useField<string>("streamingMode");
const { value: issuer } = useField<string>("issuer");
const { value: labels } = useField<Record<string, string>>("labels");
const { value: annotations } = useField<Record<string, string>>("annotations");
const { value: mode } = useField<string>("mode", "", {
  initialValue: "standalone",
});

const databaseModes = ref(["standalone", "HA", "replica"]);
const storageClasses = ref([
  { label: "local-path", value: "local-path" },
  { label: "longhorn", value: "longhorn" },
]);
const alertsList = ref(["Critical", "Info", "None", "Warning"]);
const issuerList = ref(["ace-Incluster"]);
const namespaces = ref([
  { label: "demo", value: "demo" },
  { label: "ace", value: "demo" },
  { label: "default", value: "default" },
]);
const versions = ref([
  { label: "13.40", value: "13.40" },
  { label: "17.4", value: "17.4" },
  { label: "14.17", value: "14.17" },
  { label: "15.12", value: "15.12" },
]);
const machines = ref([
  { label: "custom", value: "custom" },
  { label: "db.t.micro", value: "db.t.micro" },
  { label: "db.t.small", value: "db.t.small" },
  { label: "db.t.medium", value: "db.t.medium" },
  { label: "db.t.large", value: "db.t.large" },
]);
const deletionPolicies = ref([
  { label: "Delete", value: "Delete" },
  { label: "Halt", value: "Halt" },
  { label: "WipeOut", value: "WipeOut" },
  { label: "DoNotTerminate", value: "DoNotTerminate" },
]);
const previewTitle = computed(() => {
  return `Create Postgres: ${namespace.value}/${name.value}`;
});

const payload = computed<KubeResource>(() => ({
  apiVersion: "kubedb.com/v1",
  kind: "Postgres",
  metadata: {
    annotations: annotations.value,
    labels: labels.value,
    name: name.value,
    namespace: namespace.value,
  },
  spec: {
    deletionPolicy: deletionPolicy.value,
    storage: {
      accessModes: ["ReadWriteOnce"],
      resources: {
        requests: {
          storage: storageSize.value,
        },
      },
      storageClassName: storageClass.value,
    },
    storageType: "Durable",
    version: version.value,
  },
}));

watch(values, async () => {
  await validate();
  const validated = Object.values(errors.value).every((value) => value === "");
  disableNextBtn.value = !validated;
});

const updatePayload = (e: KubeResource) => {
  console.log(e);
};

const createPgInstance = async () => {
  const url = `/k8s/clusters/${clusterId.value}/apis/kubedb.com/v1alpha2/namespaces/${namespace.value}/postgreses`;
  try {
    await $axios.post(url, payload.value);
  } catch (e) {
    console.log(e);
  }
};

const getPgList = async () => {
  // /k8s/clusters/c-pgb8v/api/v1/namespaces/ace/services/ace-platform-api/proxy
  //  "/k8s/clusters/c-ln4df/api/v1/namespaces/ace/services/ace-platform-api/proxy"

  try {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: "/api/v1/clusters/rancher/rancher-imported-cluster/helm/packageview/values",
          verb: "GET",
          query:
            "name=kubedbcom-postgres-editor-options&sourceApiGroup=source.toolkit.fluxcd.io&sourceKind=HelmRepository&sourceNamespace=kubeops&sourceName=appscode-charts-oci&version=v0.19.0&group=kubedb.com&kind=Postgres&variant=default&namespace=default&format=json",
          body: "",
        },
      }
    );
    const data = response.data.response.body;
    console.log(data);
    pgList.value = data.items;
  } catch (error) {
    console.error("Error loading data:", error);
  }
};

const getClusters = async () => {
  try {
    const result = await store.dispatch("management/findAll", {
      type: "management.cattle.io.cluster",
    });
    clusterIdList.value = result.map((ele: { id: string }) => {
      return ele.id;
    });
  } catch (e) {
    console.log(e);
  }
};

const gotoNext = () => {
  validate();
  if (step.value === 1) step.value = 2;
  else {
    createPgInstance();
  }
};
const AdvancedToogleSwitch = ref({
  DbConfig: true,
  AuthCred: true,
  Pitr: true,
});
const AdditionalToggleSwitch = ref({
  Monitoring: true,
  Backup: true,
  Archiver: true,
  TLS: true,
  Expose: true,
});
const genericNameSpaces = ref({
  show: true,
  disabled: false,
  options: namespaces.value,
  searchable: true,
  multiple: false,
  label: "Namespace",
  placeholder: "Select Namespace",
  required: true,
  rules: [required],
  clearable: true,
  namespaceModel: namespace,
});
const genericVersions = ref({
  show: true,
  disabled: false,
  options: versions.value,
  searchable: true,
  multiple: false,
  label: "Version",
  placeholder: "Select Version",
  required: true,
  rules: [required],
  clearable: true,
  versionModel: version,
});
const genericName = ref({
  show: true,
  disabled: false,
  label: "Name",
  placeholder: "Databse Name",
  required: true,
  rules: [required],
  minHeight: 30,
  nameModel: name,
});
const genericStorageSize = ref({
  show: true,
  disabled: false,
  label: "Storage Size",
  placeholder: "Input Storage Size",
  required: true,
  rules: [required],
  minHeight: 30,
  storageSizeModel: storageSize,
});
const genericStorageClass = ref({
  show: true,
  disable: false,
  label: "Storage Class",
  placeholder: "Select Storage Class",
  required: true,
  rules: [required],
  searchable: true,
  options: storageClasses.value,
  multiple: false,
  storageClassModel: storageClass,
});
const genericDeletionPolicy = ref({
  show: true,
  disabled: false,
  options: deletionPolicies.value,
  searchable: true,
  multiple: false,
  label: "Deletion Policy",
  placeholder: "Select Deletion Policy",
  required: true,
  rules: [required],
  clearable: true,
  deletionPolicyModel: deletionPolicy,
});
const genericReplica = ref({
  show: true,
  disabled: false,
  label: "Replicas",
  placeholder: "",
  required: true,
  rules: [required],
  clearable: true,
  minHeight: 30,
  replicaModel: replicas,
});
const genericMachine = ref({
  show: true,
  options: machines.value,
  searchable: true,
  multiple: false,
  label: "Machine Profile",
  placeholder: "Select machine",
  machineModel: machine,
  rules: [required],
});
const genericCPU = ref({
  show: true,
  label: "cpu",
  placeholder: "cpu limits",
  baseUnit: "core",
  cpuModel: cpu,
  min: 0,
});
const genericMemory = ref({
  show: true,
  label: "Memory",
  placeholder: "memory limits",
  baseUnit: "Gi",
  memoryModel: memory,
  min: 0,
})
onMounted(() => {
  validate();
  getClusters();
  getPgList();
});
</script>

<template>
  <div class="m-20">
    <h1>{{ step === 1 ? "Create Postgres" : previewTitle }}</h1>
    <div v-if="step === 1">
      <div class="mb-20">
        <LabeledSelect
          v-model:value="clusterId"
          :clearable="false"
          :options="clusterIdList"
          :disabled="false"
          :searchable="true"
          :multiple="false"
          label="Cluster"
          placeholder="Select Cluster"
          required
          :rules="[required]"
        />
      </div>

      <!-- Basic Configuration Component -->
      <BasicDbConfig
        :genericNameSpaces="genericNameSpaces"
        :genericVersions="genericVersions"
        :genericName="genericName"
        :database-modes="databaseModes"
        :required="required"
        :genericStorageSize="genericStorageSize"
        :genericStorageClass="genericStorageClass"
        :genericReplica="genericReplica"
        :genericMachine="genericMachine"
        :genericCPU="genericCPU"
        :genericMemory="genericMemory"
      />
      
      <AdvancedDbConfig
        :AdvancedToogleSwitch="AdvancedToogleSwitch"
        :genericDeletionPolicy="genericDeletionPolicy"
        :required="required"
      />

      <AdditionalOptions
        :alerts-list="alertsList"
        :issuer-list="issuerList"
        :AdditionalToggleSwitch="AdditionalToggleSwitch"
      />
    </div>

    <YamlEditor
      v-if="step === 2"
      ref="yamleditor"
      v-model:value="payload"
      :mode="mode"
      :asObject="true"
      :initial-yaml-values="payload"
      class="yaml-editor flex-content"
      :editor-mode="EDITOR_MODES.EDIT_CODE"
      @update:value="updatePayload"
    />

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
    <pre>{{ errors }}</pre>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-between;
}
</style>
