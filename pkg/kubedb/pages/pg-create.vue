<script setup lang="ts">
import BasicDbConfig from "./BasicDbConfig.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useForm, useField } from "vee-validate";
import { useStore } from "vuex";
import $axios from "../composables/axios";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Accordion from "@rancher/shell/rancher-components/Accordion/Accordion.vue";
import ToggleSwitch from "@rancher/shell/rancher-components/Form/ToggleSwitch/ToggleSwitch.vue";
import TextAreaAutoGrow from "@rancher/shell/rancher-components/Form/TextArea/TextAreaAutoGrow.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";
import KeyValue from "@rancher/shell/components/form/KeyValue.vue";
import YamlEditor from "@rancher/shell/components/YamlEditor.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";

const required = (value: unknown) => {
  if (!!value || value === 0) {
    if (Array.isArray(value) && value.length > 0) return "";
    else if (typeof value === "object" && Object.keys(value).length > 0)
      return "";
    if (typeof value === "string" && value.length > 0) return "";
    if (typeof value === "boolean" || typeof value === "number") return "";
  }
  return "This field is required";
};

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

const isDbConfig = ref(false);
const isAuthCred = ref(false);
const isReferSecret = ref(false);
const isPitr = ref(false);
const isMonitoring = ref(false);
const isBackup = ref(false);
const isArchiver = ref(false);
const isTLS = ref(false);
const isExpose = ref(false);
const disableNextBtn = ref(true);
const clusterIdList = ref([]);

const { values, errors, validate, isValidating } = useForm({});
const { value: clusterId } = useField<string>("clusterId", required);
const { value: name } = useField<string>("name", required);
const { value: namespace } = useField<string>("namespace", required);
const { value: version } = useField<string>("version", required);
// const { value: replicas } = useField<string>("replicas");
// const { value: machine } = useField<string>("machine");
// const { value: cpu } = useField<string>("cpu");
// const { value: memory } = useField<string>("memory");
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
const storageClasses = ref(["local-path", "longhorn"]);
const deletionPolicies = ref(["Delete", "Halt", "WipeOut", "DoNotTerminate"]);
const secretsList = ref(["test1", "test2", "test3", "test4"]);
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
  "custom",
  "db.t.micro",
  "db.t.small",
  "db.t.medium",
  "db.t.large",
]);
const standbyModes = ref(["Hot", "Warm"]);
const streamingModes = ref(["Synchronous", "Asynchronous"]);

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

const updateMode = (e: string) => {
  mode.value = e;
};
const updateLabels = (e: Record<string, string>) => {
  labels.value = e;
};
const updateAnnotations = (e: Record<string, string>) => {
  annotations.value = e;
};
const updateDbConfiguration = (e: string) => {
  dbConfiguration.value = e;
};
const updatePayload = (e: KubeResource) => {
  // payload.value = e;
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
        :namespaces="namespaces"
        :versions="versions"
        :database-modes="databaseModes"
        :machines="machines"
        :storage-classes="storageClasses"
        :required="required"
        name-placeholder="Database Name"
        @update:mode="updateMode"
      />

      <!-- Advanced Configuration -->
      <Accordion title="Advanced Configuration" class="mb-20">
        <div>
          <Accordion title="Labels & Annotations" class="mb-20">
            <h3>Labels</h3>
            <KeyValue
              class="mb-20"
              key="labels"
              :value="labels"
              :protected-keys="[]"
              :toggle-filter="true"
              add-label="Add Labels"
              :add-icon="''"
              :read-allowed="false"
              :value-can-be-empty="true"
              @update:value="updateLabels"
            />
            <h3>Annotations</h3>
            <KeyValue
              class="mb-20"
              key="Annotations"
              :value="annotations"
              add-label="Add Annotations"
              :add-icon="''"
              :read-allowed="false"
              :value-can-be-empty="true"
              @update:value="updateAnnotations"
            />
          </Accordion>
        </div>

        <LabeledSelect
          class="mb-20"
          v-model:value="deletionPolicy"
          :options="deletionPolicies"
          label="Deletion Policy"
          required
        />
        <ToggleSwitch
          class="mb-20"
          :value="isAuthCred"
          off-label="Provide Authentication Credentials?"
          @update:value="isAuthCred = !isAuthCred"
        />
        <div v-if="isAuthCred">
          <ToggleSwitch
            class="mb-20"
            :value="isReferSecret"
            off-label="Refer Existing Secret?"
            @update:value="isReferSecret = !isReferSecret"
          />
          <LabeledSelect
            v-if="isReferSecret"
            class="mb-20"
            v-model:value="secret"
            :options="secretsList"
            label="Secret"
          />
          <LabeledInput
            class="mb-20"
            v-model:value="password"
            label="Password (Leave it blank to auto generate password)"
            :disabled="false"
            :min-height="30"
          />
        </div>

        <ToggleSwitch
          class="mb-20"
          :value="isDbConfig"
          off-label="Configure Database?"
          @update:value="isDbConfig = !isDbConfig"
        />
        <div v-if="isDbConfig">
          Configuration
          <TextAreaAutoGrow
            class="mb-20"
            :value="dbConfiguration"
            :min-height="120"
            @update:value="updateDbConfiguration"
          />
        </div>

        <ToggleSwitch
          class="mb-20"
          :value="isPitr"
          off-label="Point in-time recovery"
          @update:value="isPitr = !isPitr"
        />

        <div v-if="isPitr">
          <LabeledInput
            class="mb-20"
            v-model:value="pitrNamespace"
            label="Namespace"
            :min-height="30"
            :required="isPitr ? true : false"
          />
          <LabeledInput
            class="mb-20"
            v-model:value="pitrName"
            label="Name"
            :min-height="30"
            :required="isPitr ? true : false"
          />
        </div>

        <LabeledSelect
          class="mb-20"
          v-model:value="standbyMode"
          :options="standbyModes"
          label="Standby Mode"
        />
        <LabeledSelect
          class="mb-20"
          v-model:value="streamingMode"
          :options="streamingModes"
          label="Streaming Mode"
        />
      </Accordion>

      <!-- Additional Options -->
      <Accordion title="Additional Options" class="mb-20">
        <ToggleSwitch
          class="mb-20"
          :value="isMonitoring"
          off-label="Enable Monitoring?"
          @update:value="isMonitoring = !isMonitoring"
        />
        <LabeledSelect
          v-if="isMonitoring"
          class="mb-20"
          v-model:value="alert"
          :options="alertsList"
          label="Alert Options"
        />
        <ToggleSwitch
          class="mb-20"
          :value="isBackup"
          off-label="Enable Backup?"
          @update:value="isBackup = !isBackup"
        />
        <ToggleSwitch
          class="mb-20"
          :value="isArchiver"
          off-label="Enable Archiver?"
          @update:value="isArchiver = !isArchiver"
        />
        <ToggleSwitch
          class="mb-20"
          :value="isTLS"
          off-label="Enable TLS?"
          @update:value="isTLS = !isTLS"
        />
        <LabeledSelect
          v-if="isTLS"
          class="mb-20"
          v-model:value="issuer"
          :options="issuerList"
          label="Cluster Issuers"
        />
        <ToggleSwitch
          class="mb-20"
          :value="isExpose"
          off-label="Expose via Gateway ?"
          @update:value="isExpose = !isExpose"
        />
      </Accordion>
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
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-between;
}
</style>