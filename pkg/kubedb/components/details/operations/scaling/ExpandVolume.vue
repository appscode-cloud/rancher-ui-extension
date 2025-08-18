<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, computed } from "vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";
import RadioGroup from "@rancher/shell/rancher-components/Form/Radio/RadioGroup.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import { useRules } from "../../../../composables/rules";
import { useUtils } from "../../../../composables/utils";
import Loading from "@shell/components/Loading.vue";
import $axios from "../../../../composables/axios";
import { useStore } from "vuex";

const route = getCurrentInstance()?.proxy?.$route;
const { required } = useRules();
const store = useStore();
const { getClusters } = useUtils(store);
const storageSize = ref("2Gi");
const isLoading = ref(false);
const clusterName = ref("");
const timeOut = ref("");
const mode = ref("");
const apply = ref("IfReady");
const isDeploying = ref(false);
const timeoutOptions = [
  {
    label: "5 minutes",
    value: "5m",
  },
  {
    label: "10 minutes",
    value: "10m",
  },
  {
    label: "30 minutes",
    value: "30m",
  },
  {
    label: "1 hour",
    value: "1h",
  },
  {
    label: "2 hours",
    value: "2h",
  },
  {
    label: "5 hours",
    value: "5h",
  },
  {
    label: "10 hours",
    value: "10h",
  },
];

const applyOptions = [
  {
    label: "IfReady (OpsRequest will be applied if database is ready)",
    value: "IfReady",
  },
  {
    label: "Always (OpsRequest will always be applied)",
    value: "Always",
  },
];

const modeOptions = [
  {
    label: "Offline",
    value: "Offline",
  },
  {
    label: "Online",
    value: "Online",
  },
];
const payload = computed(() => {
  const timestamp = Math.floor(Date.now() / 1000);
  const kind = route?.params.kind === "postgreses" ? "PostgresOpsRequest" : "";
  return {
    apiVersion: "ops.kubedb.com/v1alpha1",
    kind: kind,
    metadata: {
      name: `${route?.params.dbName}-${timestamp}-volumeexpansion`,
      namespace: route?.params.namespace,
    },
    spec: {
      databaseRef: {
        name: route?.params.dbName,
      },
      type: "VolumeExpansion",
      apply: apply.value,
      volumeExpansion: { postgres: storageSize.value, mode: mode.value },
      timeout: timeOut.value,
    },
  };
});

const onDeploy = async () => {
  isDeploying.value = true;
  try {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `api/v1/clusters/rancher/${clusterName.value}/resources`,
          verb: "POST",
          query: ``,
          body: JSON.stringify(payload.value),
        },
      }
    );

    const data = await JSON.parse(response.data.response?.body);

    isDeploying.value = false;
    return { values: data };
  } catch (error) {
    isDeploying.value = false;
    console.error(error);
    return { values: {}, error: "" };
  }
};

onMounted(async () => {
  isLoading.value = true;
  clusterName.value = await getClusters(route?.params.cluster as string);
  isLoading.value = false;
});
</script>

<template>
  <div>
    <div v-if="isLoading">
      <Loading />
    </div>
    <div v-else>
      <LabeledInput
        class="mb-20"
        v-model:value="storageSize"
        label="Replicas"
        :disabled="false"
        :required="true"
        :rules="[required]"
        min-height="30"
      />

      <LabeledSelect
        class="mb-20"
        v-model:value="mode"
        :clearable="true"
        :options="modeOptions"
        :disabled="false"
        :searchable="true"
        label="Mode"
        placeholder=""
        :required="true"
      />
      <LabeledSelect
        class="mb-20"
        v-model:value="timeOut"
        :clearable="true"
        :options="timeoutOptions"
        label="Timeout"
        placeholder=""
        :required="false"
      />
      <RadioGroup
        v-model:value="apply"
        label="Apply"
        :options="applyOptions"
        :row="false"
      />

      <div class="button-container">
        <div class="button-group">
          <RcButton
            primary
            @click="onDeploy"
            :disabled="!storageSize || !mode || isDeploying"
            >{{ isDeploying ? "Loading..." : "Deploy" }}
          </RcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
.button-group {
  display: flex;
  gap: 8px;
}
</style>
