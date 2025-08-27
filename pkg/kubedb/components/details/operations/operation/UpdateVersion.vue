<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, computed, watch } from "vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";
import RadioGroup from "@rancher/shell/rancher-components/Form/Radio/RadioGroup.vue";
import Banner from "@rancher/shell/rancher-components/Banner/Banner.vue";
import { useRules } from "../../../../composables/rules";
import { useUtils } from "../../../../composables/utils";
import Loading from "@shell/components/Loading.vue";
import $axios from "../../../../composables/axios";
import { useStore } from "vuex";

const props = defineProps<{ isTabChanged: boolean }>();

const route = getCurrentInstance()?.proxy?.$route;
const { required } = useRules();
const store = useStore();
const { getClusters } = useUtils(store);
const targetVersion = ref("");
const isLoading = ref(false);
const clusterName = ref("");
const timeOut = ref("");
const apply = ref("IfReady");
const isDeploying = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
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

const payload = computed(() => {
  const timestamp = Math.floor(Date.now() / 1000);
  const kind = route?.params.kind === "postgreses" ? "PostgresOpsRequest" : "";
  return {
    apiVersion: "ops.kubedb.com/v1alpha1",
    kind: kind,
    metadata: {
      name: `${route?.params.dbName}-${timestamp}-updateversion`,
      namespace: route?.params.namespace,
    },
    spec: {
      databaseRef: {
        name: route?.params.dbName,
      },
      type: "UpdateVersion",
      apply: apply.value,
      updateVersion: {
        targetVersion: targetVersion.value,
      },
      timeout: timeOut.value,
    },
  };
});

const onClick = () => {
  onDeploy();
};

const onDeploy = async () => {
  const owner = "rancher-org";
  isDeploying.value = true;
  try {
    await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `api/v1/clusters/${owner}/${clusterName.value}/resources`,
          verb: "POST",
          query: ``,
          body: JSON.stringify(payload.value),
        },
      }
    );

    successMsg.value = "Created Successfully";
    isDeploying.value = false;
  } catch (error) {
    isDeploying.value = false;
    errorMsg.value = "Something went wrong";
  }
};

function versionCompare(v1: string, v2: string) {
  const arr1 = v1.split(".").map(Number);
  const arr2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
    const num1 = arr1[i] || 0;
    const num2 = arr2[i] || 0;

    if (num1 > num2) return 1; // v1 is higher
    if (num1 < num2) return -1; // v2 is higher
  }
  return 0; // versions are equal
}

function isVersionWithinConstraints(version: string, constraints: string) {
  let constraintsArr = [];
  if (constraints.includes(","))
    constraintsArr = constraints?.split(",")?.map((c) => c.trim());
  else constraintsArr = [constraints];

  for (let constraint of constraintsArr) {
    let match = constraint.match(/^(>=|<=|>|<)/);
    let operator = match ? match[0] : "";
    let constraintVersion = constraint.replace(/^(>=|<=|>|<)/, "").trim();

    let comparison = versionCompare(version, constraintVersion);
    if (
      (operator === ">=" && comparison < 0) ||
      (operator === "<=" && comparison > 0) ||
      (operator === ">" && comparison <= 0) ||
      (operator === "<" && comparison >= 0)
    )
      return false;
  }
  return true;
}

const fetchVersions = async () => {
  const owner = "rancher-org";

  try {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/clusters/${owner}/${clusterName.value}/proxy/charts.x-helm.dev/v1alpha1/clusterchartpresets/kubedb-ui-presets`,
          verb: "GET",
          query: ``,
          body: "",
        },
      }
    );
    console.log({ response });
    const presetResp = await JSON.parse(response.data.response?.body);
    const presets = presetResp.data?.spec?.values?.spec;

    const presetVersions =
      presets.admin?.databases?.Postgres?.versions?.available || [];

    const queryParams = {
      filter: {
        items: {
          metadata: { name: null },
          spec: { version: null, deprecated: null, updateConstraints: null },
        },
      },
    };

    const versionResp = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/clusters/${owner}/${clusterName.value}/proxy/catalog.kubedb.com/v1alpha1/postgresversions`,
          verb: "GET",
          query: JSON.stringify(`params: ${queryParams}`),
          body: "",
        },
      }
    );

    const resp = await JSON.parse(versionResp.data.response?.body);

    const resources = (resp && resp.data && resp.data.items) || [];

    const sortedVersions = resources.sort(
      (a: { spec: { version: string } }, b: { spec: { version: string } }) =>
        versionCompare(a.spec.version, b.spec.version)
    );

    let ver = "0";
    const found = sortedVersions.find(
      (item: { metadata: { name: string } }) => item.metadata.name === ver
    );
    if (found) ver = found.spec?.version;
    const allowed = found?.spec?.updateConstraints?.allowlist || [];
    const limit = allowed.length ? allowed[0] : "0.0";

    // keep only non deprecated & kubedb-ui-presets & within constraints of current version
    // if presets.status is 404, it means no presets available, no need to filter with presets
    const filteredPostgresVersions = sortedVersions.filter(
      (item: Record<string, any>) => {
        // default limit 0.0 means no restrictions, show all higher versions
        if (limit === "0.0")
          return (
            !item.spec?.deprecated &&
            (presets.status === "404" ||
              presetVersions.includes(item.metadata?.name)) &&
            versionCompare(item.spec?.version, ver) >= 0
          );
        // if limit doesn't have any operator, it's a single version
        else if (!limit.match(/^(>=|<=|>|<)/))
          return (
            !item.spec?.deprecated &&
            (presets.status === "404" ||
              presetVersions.includes(item.metadata?.name)) &&
            item.spec?.version === limit
          );
        // if limit has operator, check version with constraints
        else
          return (
            !item.spec?.deprecated &&
            (presets.status === "404" ||
              presetVersions.includes(item.metadata?.name)) &&
            isVersionWithinConstraints(item.spec?.version, limit)
          );
      }
    );

    return filteredPostgresVersions.map(
      (item: { metadata: { name: string }; spec: { version: string } }) => {
        const name = (item.metadata && item.metadata.name) || "";
        const specVersion = (item.spec && item.spec.version) || "";
        return {
          text: `${name} (${specVersion})`,
          value: name,
        };
      }
    );
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  isLoading.value = true;
  clusterName.value = await getClusters(route?.params.cluster as string);
  await fetchVersions();
  isLoading.value = false;
});

watch(
  () => props.isTabChanged,
  () => {
    errorMsg.value = "";
    successMsg.value = "";
  }
);
</script>

<template>
  <div>
    <div v-if="isLoading">
      <Loading />
    </div>
    <div v-else>
      <LabeledSelect
        class="mb-20"
        v-model:value="targetVersion"
        :clearable="true"
        :options="[]"
        :multiple="false"
        label="Select Target version"
        :required="true"
        :rules="[required]"
      />
      <LabeledSelect
        class="mb-20"
        v-model:value="timeOut"
        :clearable="true"
        :options="timeoutOptions"
        :disabled="false"
        :searchable="false"
        :multiple="false"
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
            @click="onClick"
            :disabled="isDeploying || !targetVersion"
            >{{ isDeploying ? "Loading..." : "Deploy" }}
          </RcButton>
        </div>
      </div>

      <Banner
        v-if="errorMsg && !successMsg"
        color="error"
        :label="errorMsg"
        :closable="true"
        @close="errorMsg = ''"
      />
      <Banner
        v-if="successMsg"
        color="success"
        :label="successMsg"
        :closable="true"
        @close="successMsg = ''"
      />
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
