<script setup lang="ts">
import $axios from "../composables/axios";
import {
  App,
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import { useStore } from "vuex";
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";
import SimpleBox from "@rancher/shell/components/SimpleBox.vue";
import RcButton from "@shell/rancher-components/RcButton/RcButton.vue";
import Loading from "@shell/components/Loading.vue";
import { useUtils } from "../composables/utils";
import LongRunningTask from "../components/long-running-task/LongRunningTaskModal.vue";
import { useNats } from "../composables/nats";

// need to call this on every component.
const { natsConnect } = useNats();
natsConnect(getCurrentInstance()?.appContext.app as App<Element>);

const { getRandomUUID, formatJson } = useUtils();
const store = useStore();
const route = getCurrentInstance()?.proxy?.$route;
const router = getCurrentInstance()?.proxy?.$router;
const clusterName = ref("");
const isLoading = ref(false);
const group = route?.params.group;
const version = route?.params.version;
const resource = route?.params.kind;
const namespace = route?.params.namespace;
const dbName = route?.params.dbName;

const { getRandomUUID } = useUtils();
const store = useStore();
const route = getCurrentInstance()?.proxy?.$route;
const router = getCurrentInstance()?.proxy?.$router;
const clusterName = ref("");
const isLoading = ref(false);
const group = route?.params.group;
const version = route?.params.version;
const resource = route?.params.kind;
const namespace = route?.params.namespace;
const dbName = route?.params.dbName;

const query = {
  apiVersion: "meta.k8s.appscode.com/v1alpha1",
  kind: "Render",
  request: {
    convertToTable: true,
    layoutName: `${group}-${version}-${resource}-kubedb`,
    renderBlocks: ["Connection"], // this includes info & insight
    source: {
      ref: { name: dbName, namespace: namespace },
      resource: { group: group, name: resource, version: version },
    },
  },
};

const query = {
  apiVersion: "meta.k8s.appscode.com/v1alpha1",
  kind: "Render",
  request: {
    convertToTable: true,
    layoutName: `${group}-${version}-${resource}-kubedb`,
    renderBlocks: ["Connection"], // this includes info & insight
    source: {
      ref: { name: dbName, namespace: namespace },
      resource: { group: group, name: resource, version: version },
    },
  },
};

const sortableHeaders = computed(() =>
  nodeTable.value.columns.map((col) => ({
    name: col.name,
    label: col.name,
    value: col.name,
    sort: col.name === "Name" || col.name === "Age" ? [col.name] : [],
  }))
);

const renderApi = async (showLoader: boolean) => {
  if (showLoader) isLoading.value = true;
  try {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/api/v1/clusters/rancher/${clusterName.value}/proxy/meta.k8s.appscode.com/v1alpha1/renders`,
          verb: "GET",
          query: `q=${JSON.stringify(query)}`,
          body: "",
        },
      }
    );

    //     const data = await JSON.parse(response.data.response?.body);
    //     const blocks = data.response.view.pages[0].sections[0];

    // info table
    const infoCols = blocks.info.table.columns;
    const infoCells = blocks.info.table.rows[0].cells;

    const tempInfoBlock = infoCols.map((col: any, idx: number) => {
      if (col.name === "Annotations") {
        const output: Record<string, any> = {};

        for (const key in infoCells[idx].data) {
          const value = infoCells[idx].data[key];

          if (
            typeof value === "string" &&
            (value.trim().startsWith("{") || value.trim().startsWith("["))
          ) {
            try {
              output[key] = JSON.parse(value);
            } catch {
              output[key] = value;
            }
          } else {
            output[key] = value;
          }
        }
        return {
          label: col.name,
          value: output,
        };
      }
      return {
        label: col.name,
        value: infoCells[idx].data,
      };
    });

    infoBlock.value = tempInfoBlock;

    infoBlock.value = tempInfoBlock;

    // insight table
    const insightCols = blocks.insight.table.columns;
    const insightCells = blocks.insight.table.rows[0].cells;

    const tempInsightBlock = insightCols.map((col: any, idx: number) => ({
      label: col.name,
      value: insightCells[idx].data,
    }));

    insightBlock.value = tempInsightBlock;

    // nodes table
    const nodeBlock = blocks.blocks.find((b: any) => b.name === "Nodes");
    if (nodeBlock?.table) {
      // Filter out "dashboard" and "connect" columns
      const excludedColumns = ["dashboard", "connect"];

      //       const filteredColumns = nodeBlock.table.columns.filter(
      //         (col: any) => !excludedColumns.includes(col.name.toLowerCase())
      //       );

      //       const includedIndexes = filteredColumns.map((col: any) =>
      //         nodeBlock.table.columns.findIndex((c: any) => c.name === col.name)
      //       );

      //       const filteredRows = nodeBlock.table.rows.map((row: any) => ({
      //         ...row,
      //         cells: includedIndexes.map((idx: number) => row.cells[idx]),
      //       }));

      nodeTable.value = {
        columns: filteredColumns,
        rows: filteredRows,
      };
    }
  } catch (error) {
    console.error(error);
  }
  isLoading.value = false;
};

//Long Running Task
const showDialog = ref(false);
const natsSubject = ref("");
const connectionError = ref("");
const isNatsConnectionLoading = ref(false);
const uuid = getRandomUUID();
natsSubject.value = `natjobs.resp.${uuid}`;

const singleDbDelete = async () => {
  isNatsConnectionLoading.value = true;
  showDialog.value = true;
  try {
    await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/api/v1/clusters/rancher/${clusterName.value}/helm/editor`,
          verb: "DELETE",
          query: `releaseName=${dbName}&namespace=${namespace}&group=${group}&version=${version}&name=${resource}&response-id=${uuid}`,
          body: "",
        },
      }
    );
  } catch (error: unknown) {
    connectionError.value = error as string;
    console.error("Error loading data:", error);
  }
  showDialog.value = true;
  isNatsConnectionLoading.value = false;
};

      nodeTable.value = {
        columns: filteredColumns,
        rows: filteredRows,
      };
    }
  } catch (error) {
    console.error(error);
  }
  isLoading.value = false;
};

//Long Running Task
const showDialog = ref(false);
const natsSubject = ref("");
const connectionError = ref("");
const isNatsConnectionLoading = ref(false);
const uuid = getRandomUUID();
natsSubject.value = `natjobs.resp.${uuid}`;

const singleDbDelete = async () => {
  isNatsConnectionLoading.value = true;
  showDialog.value = true;
  try {
    await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/api/v1/clusters/rancher/${clusterName.value}/helm/editor`,
          verb: "DELETE",
          query: `releaseName=${dbName}&namespace=${namespace}&group=${group}&version=${version}&name=${resource}&response-id=${uuid}`,
          body: "",
        },
      }
    );
  } catch (error: unknown) {
    connectionError.value = error as string;
    console.error("Error loading data:", error);
  }
  showDialog.value = true;
  isNatsConnectionLoading.value = false;
};

const getClusters = async () => {
  try {
    const result = await store.dispatch("management/findAll", {
      type: "management.cattle.io.cluster",
    });
    result.forEach((ele: { id: string; spec: { displayName: string } }) => {
      if (ele.id === route?.params?.cluster) {
        clusterName.value = ele.spec.displayName;
      }
    });
  } catch (e) {
    console.log(e);
  }
};

let intervalId: ReturnType<typeof setInterval>;
onMounted(async () => {
  await getClusters();
  renderApi(true);
  intervalId = setInterval(() => {
    renderApi(false);
  }, 10000);
});
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div>
    <div v-if="isLoading">
      <Loading />
    </div>
    <div v-else>
      <div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <h2>Database Info</h2>
          <RcButton danger @click="singleDbDelete">Delete</RcButton>
        </div>
        <div v-for="(item, i) in infoBlock" :key="'info-' + i">
          <div
            style="
              display: flex;
              align-items: start;
              gap: 8px;
              margin-bottom: 16px;
            "
          >
            <strong style="min-width: 150px">{{ item.label }}:</strong>

            <pre
              v-if="item.label === 'Annotations' || item.label === 'Labels'"
              style="
                max-width: 100%;
                max-height: 200px;
                overflow: auto;
                white-space: pre-wrap;
              "
            >
               {{ formatJson(item.value) }}
            </pre>
            <span v-else>{{ item.value }}</span>
          </div>
        </div>

      <div style="margin-top: 24px">
        <h2 style="margin-bottom: 16px; display: flex">Database Insights</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 16px">
          <div
            class="simple-box-container"
            v-for="(item, i) in insightBlock"
            :key="'insight-' + i"
          >
            <SimpleBox class="simple-box">
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 8px;
                "
              >
                <span>{{ item.label }}: </span>
                <strong style="font-size: 16px">{{ item.value }}</strong>
              </div>
            </SimpleBox>
          </div>
        </div>
      </div>

      <SortableTable
        v-if="nodeTable.columns.length > 0"
        :rows="sortableRows"
        :headers="sortableHeaders"
        :paging="true"
        :rows-per-page="5"
        :table-actions="false"
        :row-actions="false"
      >
        <template
          v-for="header in sortableHeaders"
          #[`col:${header.name}`]="{ row }"
        >
          <td>{{ row[header.name] }}</td>
        </template>
        <template #header-left>
          <h1>Nodes</h1>
        </template>
      </SortableTable>
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
            const path = `/c/${route?.params.cluster}/kubedb/overview`;
            router?.push(path);
          },
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.simple-box-container {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.simple-box {
  width: 300px;
}
</style>
