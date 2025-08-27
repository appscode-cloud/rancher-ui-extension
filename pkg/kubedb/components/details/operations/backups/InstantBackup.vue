<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, computed, watch } from "vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";
import Banner from "@rancher/shell/rancher-components/Banner/Banner.vue";
import { useRules } from "../../../../composables/rules";
import { useUtils } from "../../../../composables/utils";
import Loading from "@shell/components/Loading.vue";
import $axios from "../../../../composables/axios";
import { useStore } from "vuex";

const props = defineProps<{ isTabChanged: boolean }>();

const route = getCurrentInstance()?.proxy?.$route;
const store = useStore();
const { required } = useRules();
const { getClusters } = useUtils(store);
const replicas = ref(1);
const isLoading = ref(false);
const backups = ref<Array<Record<string, string>>>();
const backupConfigurationsOptions = ref<{ label: string; value: string }[]>();
const clusterName = ref("");
const selectedBackup = ref("");
const selectedSessions = ref("");
const isDeploying = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const backupName = ref("");
const backupNamespace = ref("");

const payload = computed(() => {
  const timestamp = Math.floor(Date.now() / 1000);
  return {
    apiVersion: "core.kubestash.com/v1alpha1",
    kind: "BackupSession",
    metadata: {
      labels: { "kubestash.com/invoker-name": route?.params.dbName },
      name: `${route?.params.dbName}-full-backup-${timestamp}`,
      namespace: route?.params.namespace,
    },
    spec: {
      invoker: {
        apiGroup: "core.kubestash.com",
        kind: "BackupConfiguration",
        name: route?.params.dbName,
      },
      session: selectedSessions,
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
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `api/v1/clusters/${owner}/${clusterName.value}/proxy/core.kubestash.com/v1alpha1/namespaces/${route?.params.namespace}/backupsessions`,
          verb: "POST",
          query: ``,
          body: JSON.stringify(payload.value),
        },
      }
    );

    await JSON.parse(response.data.response?.body);
    successMsg.value = "Created Successfully";
    isDeploying.value = false;
  } catch (error) {
    isDeploying.value = false;
    errorMsg.value = "Something went wrong";
  }
};

const getBackupConfigurations = async () => {
  const owner = "rancher-org";
  try {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/clusters/${owner}/${clusterName.value}/proxy/core.kubestash.com/v1alpha1/namespaces/${route?.params.namespace}/backupconfigurations`,
          verb: "GET",
          query: ``,
          body: "",
        },
      }
    );

    const resp = await JSON.parse(response.data.response?.body);
    const items = resp.data.items;

    backups.value = items;

    const options: { label: string; value: string }[] = [];
    items.forEach(
      (ele: {
        spec: { target: { name: string; namespace: string } };
        metadata: { name: string; namespace: string };
      }) => {
        if (
          ele.spec?.target?.name === route?.params.dbName &&
          ele.spec?.target?.namespace === route?.params.namespace
        ) {
          const tx = `${ele.metadata.namespace}/${ele.metadata.name}`;
          options.push({ label: tx, value: ele.metadata.name });
        }
      }
    );
    return options;
  } catch (error) {}
};

const SessionsOptions = computed(() => {
  let sessions: Array<Record<string, string>> = [];
  backups.value?.forEach((ele: Record<string, any>) => {
    if (ele.metadata.name === selectedBackup.value) {
      backupName.value = ele.metadata.name;
      backupNamespace.value = ele.metadata.namespace;
      sessions = ele.spec.sessions;
    }
  });
  const optionsArray = sessions?.map((ele) => ele.name);
  return optionsArray;
});

onMounted(async () => {
  isLoading.value = true;
  clusterName.value = await getClusters(route?.params.cluster as string);
  backupConfigurationsOptions.value = await getBackupConfigurations();
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
        v-model:value="selectedBackup"
        :clearable="true"
        :options="backupConfigurationsOptions"
        :searchable="true"
        :multiple="false"
        label="Select Backup"
        placeholder=""
        :rules="[required]"
        :required="true"
      />

      <LabeledSelect
        class="mb-20"
        v-model:value="selectedSessions"
        :clearable="false"
        :options="SessionsOptions"
        :searchable="true"
        :multiple="true"
        label="Select Sessions"
        placeholder=""
        :rules="[required]"
        :required="true"
      />

      <div class="button-container">
        <div class="button-group">
          <RcButton
            primary
            @click="onClick"
            :disabled="
              (!selectedBackup && !selectedSessions.length) || isDeploying
            "
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
