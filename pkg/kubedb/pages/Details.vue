<script setup lang="ts">
import {
  App,
  computed,
  CSSProperties,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import $axios from "../composables/axios";
import { useNats } from "../composables/nats";
import { useUtils } from "../composables/utils";
import Tab from "@shell/components/Tabbed/Tab.vue";
import Loading from "@shell/components/Loading.vue";
import Tabbed from "@shell/components/Tabbed/index.vue";
import LongRunningTask from "../components/long-running-task/LongRunningTaskModal.vue";
import InsightDetails from "../components/InsightDetails.vue";
import OverviewDetails from "../components/OverviewDetails.vue";
import RcButton from "@shell/rancher-components/RcButton/RcButton.vue";

// need to call this on every component.
const { natsConnect } = useNats();
natsConnect(getCurrentInstance()?.appContext.app as App<Element>);

const { getRandomUUID, getClusters } = useUtils();
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

/// overview declare starts
const overviewInfoBlock = ref<any[]>([]);
const overviewInsightBlock = ref<any[]>([]);
const overviewNodeTable = ref<{ columns: any[]; rows: any[] }>({
  columns: [],
  rows: [],
});

const overviewSortableHeaders = computed(() =>
  overviewNodeTable.value.columns.map((col) => ({
    name: col.name,
    label: col.name,
    value: col.name,
    sort: col.name === "Name" || col.name === "Age" ? [col.name] : [],
  }))
);

const overviewSortableRows = computed(() =>
  overviewNodeTable.value.rows.map((row) => {
    const obj: Record<string, string> = {};
    row?.cells.forEach((cell: any, i: number) => {
      obj[overviewNodeTable.value.columns[i].name] = cell.data;
    });
    return obj;
  })
);

const overviewGrafanaRows = ref<Array<{ data: string }>>([]);
/// overview declare ends

/// insight declare starts
const insightInfoBlock = ref<any[]>([]);
const insightInsightBlock = ref<any[]>([]);

const insightDatabasesTable = ref<{ columns: any[]; rows: any[] }>({
  columns: [],
  rows: [],
});
const insightDatabasesHeaders = computed(() =>
  insightDatabasesTable.value.columns.map((col) => ({
    name: col.name,
    label: col.name,
    value: col.name,
    sort: [],
  }))
);

const insightDatabasesRows = computed(() =>
  insightDatabasesTable.value.rows.map((row) => {
    const obj: Record<string, string> = {};
    row?.cells.forEach((cell: any, i: number) => {
      obj[insightDatabasesTable.value.columns[i].name] = cell.data;
    });
    return obj;
  })
);

const insightReplicationStatusTable = ref<{ columns: any[]; rows: any[] }>({
  columns: [],
  rows: [],
});
const insightReplicationStatusHeaders = computed(() =>
  insightReplicationStatusTable.value.columns.map((col) => ({
    name: col.name,
    label: col.name,
    value: col.name,
    sort: [],
  }))
);

const insightReplicationStatusRows = computed(() =>
  insightReplicationStatusTable.value.rows.map((row) => {
    const obj: Record<string, string> = {};
    row?.cells.forEach((cell: any, i: number) => {
      obj[insightReplicationStatusTable.value.columns[i].name] = cell.data;
    });
    return obj;
  })
);

const insightSlowQueriesTable = ref<{ columns: any[]; rows: any[] }>({
  columns: [],
  rows: [],
});
const insightSlowQueriesHeaders = computed(() =>
  insightSlowQueriesTable.value.columns.map((col) => ({
    name: col.name,
    label: col.name,
    value: col.name,
    sort: [],
  }))
);

const insightSlowQueriesRows = computed(() =>
  insightSlowQueriesTable.value.rows.map((row) => {
    const obj: Record<string, string> = {};
    row?.cells.forEach((cell: any, i: number) => {
      obj[insightSlowQueriesTable.value.columns[i].name] = cell.data;
    });
    return obj;
  })
);

const insightGrafanaDashboardTable = ref<{ columns: any[]; rows: any[] }>({
  columns: [],
  rows: [],
});
const insightGrafanaDashboardRows = computed(() =>
  insightGrafanaDashboardTable.value.rows.map((row) => {
    const obj: Record<string, string> = {};
    row?.cells.forEach((cell: any, i: number) => {
      obj[insightGrafanaDashboardTable.value.columns[i].name] = cell.data;
    });
    return obj;
  })
);
/// insight declare ends

const databaseHeaderInfo = ref<{
  version: string;
  mode: string;
  cpu: string;
  memory: string;
  storage: string;
  status: string;
}>({
  version: "loading",
  mode: "loading",
  cpu: "loading",
  memory: "loading",
  storage: "loading",
  status: "loading",
});

const featureInfo = ref<{
  exposed: { color: string; data: string };
  tls: { color: string; data: string };
  backup: { color: string; data: string };
  monitoring: { color: string; data: string };
}>({
  exposed: { color: "", data: "" },
  tls: { color: "", data: "" },
  backup: { color: "", data: "" },
  monitoring: { color: "", data: "" },
});

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

    const data = await JSON.parse(response.data.response?.body);

    console.log({ Render: data });

    //Header info
    databaseHeaderInfo.value.version =
      data.response.view.header.table?.rows[0]?.cells[1];
    databaseHeaderInfo.value.mode =
      data.response.view.header.table?.rows[0]?.cells[2].data;
    databaseHeaderInfo.value.cpu = `${data.response.view.header.table?.rows[0]?.cells[3]?.data.request} / ${data.response.view.header.table?.rows[0]?.cells[3].data.limit}`;
    databaseHeaderInfo.value.memory = `${data.response.view.header.table.rows[0]?.cells[4]?.data.request} / ${data.response.view.header.table?.rows[0]?.cells[4].data.limit}`;
    databaseHeaderInfo.value.storage = `${data.response.view.header.table.rows[0]?.cells[5]?.data.request} / ${data.response.view.header.table?.rows[0]?.cells[5].data.limit}`;
    databaseHeaderInfo.value.status =
      data.response.view.header.table?.rows[0]?.cells[6].data;
    //end of header info

    //feature info
    featureInfo.value.exposed.color =
      data.response.view.tabBar.table?.rows[0]?.cells[0].color;
    featureInfo.value.exposed.data =
      data.response.view.tabBar.table?.rows[0]?.cells[0].data;

    featureInfo.value.tls.color =
      data.response.view.tabBar.table?.rows[0]?.cells[1].color;
    featureInfo.value.tls.data =
      data.response.view.tabBar.table?.rows[0]?.cells[1].data;

    featureInfo.value.backup.color =
      data.response.view.tabBar.table?.rows[0]?.cells[2].color;
    featureInfo.value.backup.data =
      data.response.view.tabBar.table?.rows[0]?.cells[2].data;

    featureInfo.value.monitoring.color =
      data.response.view.tabBar.table?.rows[0]?.cells[3].color;
    featureInfo.value.monitoring.data =
      data.response.view.tabBar.table?.rows[0]?.cells[3].data;
    //end of feature info

    // Overview sections starts here
    const overviewBlocks = data.response.view.pages[0].sections[0];
    // info table
    const overviewInfoCols = overviewBlocks.info.table?.columns;
    const overviewInfoCells = overviewBlocks.info.table?.rows[0]?.cells;

    const overviewTempInfoBlock = overviewInfoCols
      .map((col: any, idx: number) => {
        if (col.name === "Type") {
          return {
            label: col.name,
            value: overviewInfoCells
              ? overviewInfoCells[idx].data.split("/")[1]
              : "",
          };
        }
        return {
          label: col.name,
          value: overviewInfoCells ? overviewInfoCells[idx].data : "",
        };
      })
      .filter(
        (ele: { label: string }) =>
          ele.label !== "Annotations" &&
          ele.label !== "Labels" &&
          ele.label !== "Backup Task" &&
          ele.label !== "Restore Task"
      );

    overviewInfoBlock.value = overviewTempInfoBlock;

    // insight table
    const overviewInsightCols = overviewBlocks.insight.table?.columns;
    const overviewInsightCells = overviewBlocks.insight.table?.rows[0]?.cells;

    const overviewTempInsightBlock = overviewInsightCols?.map(
      (col: any, idx: number) => ({
        label: col.name,
        value: overviewInsightCells ? overviewInsightCells[idx]?.data : "",
      })
    );

    overviewInsightBlock.value = overviewTempInsightBlock;

    // nodes table
    const overviewNodeBlock = overviewBlocks.blocks.find(
      (b: any) => b.name === "Nodes"
    );
    if (overviewNodeBlock?.table) {
      // Filter out "dashboard" and "connect" columns
      const excludedColumns = ["dashboard", "connect"];

      const filteredColumns = overviewNodeBlock.table?.columns.filter(
        (col: any) => !excludedColumns.includes(col.name.toLowerCase())
      );

      const includedIndexes = filteredColumns.map((col: any) =>
        overviewNodeBlock.table?.columns.findIndex(
          (c: any) => c.name === col.name
        )
      );

      const filteredRows = overviewNodeBlock.table?.rows.map((row: any) => ({
        ...row,
        cells: includedIndexes.map((idx: number) => row?.cells[idx]),
      }));

      overviewNodeTable.value = {
        columns: filteredColumns,
        rows: filteredRows,
      };
    }

    // Overview grafana
    const overviewGrafanaBlock = overviewBlocks.blocks.find(
      (b: any) => b.name === "Dashboards"
    );
    if (overviewGrafanaBlock?.table?.rows) {
      overviewGrafanaRows.value = overviewGrafanaBlock?.table?.rows.map(
        (ele: { cells: Array<{ data: string }> }) => {
          return ele?.cells[1];
        }
      );
    }
    // overview sections ends here

    // insight sections start here
    const insightBlocks = data.response.view.pages[1].sections[0];

    // info table
    const insightInfoCols = insightBlocks.info.table?.columns;
    const insightInfoCells = insightBlocks.info.table?.rows[0]?.cells;

    const insightTempInfoBlock = insightInfoCols.map(
      (col: any, idx: number) => {
        return {
          label: col.name,
          value: insightInfoCells ? insightInfoCells[idx].data : "",
        };
      }
    );

    insightInfoBlock.value = insightTempInfoBlock;

    // insight table
    const insightInsightCols = insightBlocks.insight.table?.columns;
    const insightInsightCells = insightBlocks.insight.table?.rows[0]?.cells;

    const insightTempInsightBlock = insightInsightCols.map(
      (col: any, idx: number) => ({
        label: col.name,
        value: insightInsightCells ? insightInsightCells[idx].data : "",
      })
    );

    insightInsightBlock.value = insightTempInsightBlock;

    // replication status
    const insightReplicaStatus = insightBlocks.blocks.find(
      (b: any) => b.name === "Replication Status"
    );
    if (insightReplicaStatus?.table) {
      const filteredColumns = insightReplicaStatus.table?.columns;
      const includedIndexes = filteredColumns.map((col: any) =>
        insightReplicaStatus.table?.columns.findIndex(
          (c: any) => c.name === col.name
        )
      );

      const filteredRows = insightReplicaStatus.table?.rows.map((row: any) => ({
        ...row,
        cells: includedIndexes.map((idx: number) => row?.cells[idx]),
      }));

      insightReplicationStatusTable.value = {
        columns: filteredColumns,
        rows: filteredRows,
      };
    }

    //Grafana Dashboard
    const insightGrafanaDashboard = insightBlocks.blocks.find(
      (b: any) => b.name === "Grafana Dashboards"
    );
    if (insightGrafanaDashboard?.table) {
      const filteredColumns = insightGrafanaDashboard.table?.columns;
      const includedIndexes = filteredColumns.map((col: any) =>
        insightGrafanaDashboard.table?.columns.findIndex(
          (c: any) => c.name === col.name
        )
      );

      const filteredRows = insightGrafanaDashboard.table?.rows.map(
        (row: any) => ({
          ...row,
          cells: includedIndexes.map((idx: number) => row?.cells[idx]),
        })
      );

      insightGrafanaDashboardTable.value = {
        columns: filteredColumns,
        rows: filteredRows,
      };
    }

    // Slow Queries
    const insightSlowQueries = insightBlocks.blocks.find(
      (b: any) => b.name === "Slow Queries"
    );
    if (insightSlowQueries?.table) {
      const filteredColumns = insightSlowQueries.table?.columns;
      const includedIndexes = filteredColumns.map((col: any) =>
        insightSlowQueries.table?.columns.findIndex(
          (c: any) => c.name === col.name
        )
      );

      const filteredRows = insightSlowQueries.table?.rows.map((row: any) => ({
        ...row,
        cells: includedIndexes.map((idx: number) => row?.cells[idx]),
      }));

      insightSlowQueriesTable.value = {
        columns: filteredColumns,
        rows: filteredRows,
      };
    }

    // Databases
    const insightDatabases = insightBlocks.blocks.find(
      (b: any) => b.name === "Databases"
    );

    if (insightDatabases?.table) {
      const filteredColumns = insightDatabases.table?.columns;
      const includedIndexes = filteredColumns.map((col: any) =>
        insightDatabases.table?.columns.findIndex(
          (c: any) => c.name === col.name
        )
      );

      const filteredRows = insightDatabases.table?.rows.map((row: any) => ({
        ...row,
        cells: includedIndexes.map((idx: number) => row?.cells[idx]),
      }));

      insightDatabasesTable.value = {
        columns: filteredColumns,
        rows: filteredRows,
      };
    }

    // insight sections ends here
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

let intervalId: ReturnType<typeof setInterval>;
onMounted(async () => {
  clusterName.value = await getClusters(route?.params.cluster as string);
  renderApi(true);
  intervalId = setInterval(() => {
    renderApi(false);
  }, 10000);
});
onUnmounted(() => {
  clearInterval(intervalId);
});

const getColor = (color: string) => {
  switch (color) {
    case "success":
      return "#16A34A";
    case "warning":
      return "#D97706";
    default:
      return "#DC2626";
  }
};

const getStatusStyle = (status: string): CSSProperties => {
  let bgColor = "";
  switch (status?.toLowerCase()) {
    case "ready":
      bgColor = "#16A34A";
      break;
    case "provisioning":
      bgColor = "#60A5FA";
      break;
    default:
      bgColor = "#DC2626";
  }

  return {
    backgroundColor: bgColor,
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "capitalize",
  };
};
</script>

<template>
  <div>
    <div v-if="isLoading">
      <Loading />
    </div>
    <div v-else>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        "
      >
        <h2>
          {{
            `${overviewInfoBlock[2]?.value}: ${overviewInfoBlock[1]?.value}/${overviewInfoBlock[0]?.value}`
          }}
        </h2>

        <RcButton danger @click="singleDbDelete">Delete</RcButton>
      </div>

      <div
        style="
          position: fixed;
          bottom: 0;
          right: 0px;
          z-index: 99999;
          width: calc(100% - 320px);
          background: var(--nav-icon-badge-bg);
          padding: 6px 16px;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.1);
        "
      >
        <div style="display: flex; gap: 16px">
          <div>{{ `Mode: ${databaseHeaderInfo.mode}` }}</div>
          <div>{{ `CPU: ${databaseHeaderInfo.cpu}` }}</div>
          <div>{{ `Memory: ${databaseHeaderInfo.memory}` }}</div>
          <div>{{ `Storage: ${databaseHeaderInfo.storage}` }}</div>
        </div>

        <div style="display: flex; gap: 16px">
          <div :style="{ color: getColor(featureInfo.exposed.color) }">
            {{
              featureInfo.exposed.color === "success"
                ? "Not Exposed"
                : "Exposed"
            }}
          </div>
          <div>
            TLS:
            <span :style="{ color: getColor(featureInfo.tls.color) }">
              <span
                v-html="
                  featureInfo.tls.color === 'success' ? '&nbsp;ON' : '&nbsp;OFF'
                "
              ></span>
            </span>
          </div>
          <div>
            Backup:
            <span :style="{ color: getColor(featureInfo.backup.color) }">
              <span
                v-html="
                  featureInfo.backup.color === 'success'
                    ? '&nbsp;ON'
                    : '&nbsp;OFF'
                "
              ></span>
            </span>
          </div>
          <div>
            Monitoring:
            <span :style="{ color: getColor(featureInfo.monitoring.color) }">
              <span
                v-html="
                  featureInfo.monitoring.color === 'success'
                    ? '&nbsp;ON'
                    : '&nbsp;OFF'
                "
              ></span>
            </span>
          </div>
          <div>
            Status:
            <span :style="getStatusStyle(databaseHeaderInfo.status)">
              {{ databaseHeaderInfo.status ?? "Unknown" }}
            </span>
          </div>
        </div>
      </div>
      <Tabbed :use-hash="true" @changed="console.log('ok')">
        <Tab name="Overview" label="Overview" weight="2">
          <div class="tab-content">
            <OverviewDetails
              :overview-info-block="overviewInfoBlock"
              :overview-insight-block="overviewInsightBlock"
              :overview-node-table="overviewNodeTable"
              :overview-sortable-headers="overviewSortableHeaders"
              :overview-sortable-rows="overviewSortableRows"
              :overview-grafana-links="overviewGrafanaRows"
              :single-db-delete="singleDbDelete"
            />
          </div>
        </Tab>
        <Tab name="insight" label="Insight" weight="1">
          <div class="tab-content">
            <InsightDetails
              :insight-databases-headers="insightDatabasesHeaders"
              :insight-databases-rows="insightDatabasesRows"
              :insight-databases-table="insightDatabasesTable"
              :insight-grafana-dashboard-rows="insightGrafanaDashboardRows"
              :insight-slow-queries-headers="insightSlowQueriesHeaders"
              :insight-info-block="insightInfoBlock"
              :insight-insight-block="insightInsightBlock"
              :insight-replication-status-rows="insightReplicationStatusRows"
              :insight-replication-status-table="insightReplicationStatusTable"
              :insight-slow-queries-rows="insightSlowQueriesRows"
              :insight-slow-queries-table="insightSlowQueriesTable"
              :insight-replication-status-headers="
                insightReplicationStatusHeaders
              "
            />
          </div>
        </Tab>
      </Tabbed>

      <LongRunningTask
        :open="showDialog"
        :nats-subject="natsSubject"
        :is-nats-connection-loading="isNatsConnectionLoading"
        :title="`Delete Resource: ${dbName}`"
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
