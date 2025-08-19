<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, computed, watch } from "vue";
import TextAreaAutoGrow from "@rancher/shell/rancher-components/Form/TextArea/TextAreaAutoGrow.vue";
import LongRunningTask from "../../../../components/long-running-task/LongRunningTaskModal.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Banner from "@rancher/shell/rancher-components/Banner/Banner.vue";
import { useRules } from "../../../../composables/rules";
import { useUtils } from "../../../../composables/utils";
import Loading from "@shell/components/Loading.vue";
import $axios from "../../../../composables/axios";
import { useStore } from "vuex";

const route = getCurrentInstance()?.proxy?.$route;
const router = getCurrentInstance()?.proxy?.$router;
const store = useStore();
const { required } = useRules();
const { getClusters, getRandomUUID } = useUtils(store);
const isLoading = ref(false);
const clusterName = ref("");
const repositoriesOptions = ref([]);
const snapshotOptions = ref([]);
const repository = ref("");
const snapshot = ref("");
const isDeploying = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const additionalParams = ref("");

const payload = computed(() => {
  const timestamp = Math.floor(Date.now() / 1000);
  return {
    metadata: {
      release: {
        name: `${route?.params.dbName}-${timestamp}-restore`,
        namespace: route?.params.namespace,
      },
      resource: {
        group: "core.kubestash.com",
        kind: "RestoreSession",
        name: "restoresessions",
        scope: "Namespaced",
        version: "v1alpha1",
      },
    },
    spec: {
      addon: {
        jobTemplate: { securityContext: 70 },
        name: "postgres-addon",
        tasks: [
          { name: "logical-backup-restore", params: additionalParams.value },
        ],
      },
      annotations: {},
      dataSource: {
        encryptionSecret: {
          name: "default-encryption-secret",
          namespace: "stash",
        },
        repository: {
          name: repository.value,
          namespace: route?.params.namespace,
        },
        snapshot: snapshot.value,
      },
      labels: {},
      target: {
        apiGroup: "kubedb.com",
        kind: "Postgres",
        name: route?.params.dbName,
        namespace: route?.params.namespace,
      },
    },
  };
});

const onClick = () => {
  onDeploy();
};

const onDeploy = async () => {
  const owner = "rancher";
  isDeploying.value = true;
  try {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/api/v1/clusters/${owner}/${clusterName.value}/helm/options/model`,
          verb: "PUT",
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

const getRepositories = async () => {
  const owner = "rancher";
  try {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/clusters/${owner}/${clusterName.value}/proxy/storage.kubestash.com/v1alpha1/namespaces/${route?.params.namespace}/repositories`,
          verb: "GET",
          query: ``,
          body: "",
        },
      }
    );
    const resp = await JSON.parse(response.data.response?.body);
    let names = resp?.data?.items;
    names.map((item: { label: any; value: any; metadata: any }) => {
      item.value = {
        name: item?.metadata?.name,
        namespace: item?.metadata?.namespace,
      };
      item.label = `${item?.metadata?.namespace}/${item?.metadata?.name}` || "";
      return true;
    });
    return names;
  } catch (error) {
    console.log(error);
  }
};

const getSnapshots = async () => {
  const owner = "rancher";
  try {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/clusters/${owner}/${clusterName.value}/proxy/storage.kubestash.com/'v1alpha1'/namespaces/${route?.params.namespace}/snapshots`,
          verb: "GET",
          query: ``,
          body: "",
        },
      }
    );
    const resp = await JSON.parse(response.data.response?.body);
    let snapshots = resp?.data?.items;
    snapshots.map(
      (item: { metadata: { name: string }; value: string; label: string }) => {
        const name = item?.metadata?.name;
        item.value = name;
        item.label = name;
        return true;
      }
    );

    const filteredSnapshots =
      snapshots.filter(
        (item: {
          metadata: { ownerReferences: { name: string; kind: string }[] };
        }) => {
          const owners = item?.metadata?.ownerReferences || [];
          if (owners.length)
            return (
              owners[0]?.name === repository.value &&
              owners[0]?.kind === "Repository"
            );
        }
      ) || [];

    return filteredSnapshots;
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  isLoading.value = true;
  clusterName.value = await getClusters(route?.params.cluster as string);
  repositoriesOptions.value = await getRepositories();
  isLoading.value = false;
});

watch(repository, async () => {
  snapshotOptions.value = await getSnapshots();
});

//Long Running Task
const showDialog = ref(false);
const natsSubject = ref("");
const connectionError = ref("");
const isNatsConnectionLoading = ref(false);
const uuid = getRandomUUID();
natsSubject.value = `natjobs.resp.${uuid}`;
</script>

<template>
  <div>
    <div v-if="isLoading">
      <Loading />
    </div>
    <div v-else>
      <LabeledSelect
        class="mb-20"
        v-model:value="repository"
        :clearable="true"
        :options="repositoriesOptions"
        :searchable="true"
        :multiple="false"
        label="Repository"
        placeholder=""
        :rules="[required]"
        :required="true"
      />

      <LabeledSelect
        class="mb-20"
        v-model:value="snapshot"
        :clearable="false"
        :options="snapshotOptions"
        :searchable="true"
        :multiple="false"
        label="Snapshot"
        placeholder=""
        :rules="[required]"
        :required="true"
      />

      <div>
        <p>Additional Parameters</p>
        <TextAreaAutoGrow
          class="mb-20 mt-10"
          v-model:value="additionalParams"
          :min-height="200"
        />
      </div>

      <div class="button-container">
        <div class="button-group">
          <RcButton
            primary
            @click="onClick"
            :disabled="(!repository && !snapshot) || isDeploying"
            >{{ isDeploying ? "Loading..." : "Deploy" }}
          </RcButton>
        </div>
      </div>

      <Banner
        v-if="errorMsg"
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

      <LongRunningTask
        :open="showDialog"
        :nats-subject="natsSubject"
        :is-nats-connection-loading="isNatsConnectionLoading"
        title="Deploying Postgres"
        :error-ctx="{
          connectionError: connectionError,
          onError: () => {
            showDialog = false;
          },
        }"
        :success-ctx="{
          onSuccess: () => {
            router?.push('overview');
          },
        }"
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
