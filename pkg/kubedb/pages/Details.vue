<script setup lang="ts">
import $axios from "../composables/axios";
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";

const store = useStore();
const route = getCurrentInstance()?.proxy?.$route;
const clusterName = ref("");
const kind = route?.params.cluster;
const namespace = route?.params.namespace;
const dbName = route?.params.dbName;

const infoBlock = ref<any[]>([]);
const insightBlock = ref<any[]>([]);
const nodeTable = ref<{ columns: any[]; rows: any[] }>({
  columns: [],
  rows: [],
});

const query = {
  apiVersion: "meta.k8s.appscode.com/v1alpha1",
  kind: "Render",
  request: {
    convertToTable: true,
    layoutName: "kubedb.com-v1-postgreses-kubedb",
    renderBlocks: ["Connection"], // this includes info & insight
    source: {
      ref: { name: dbName, namespace: namespace },
      resource: { group: "kubedb.com", name: "postgreses", version: "v1" },
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

const sortableRows = computed(() =>
  nodeTable.value.rows.map((row) => {
    const obj: Record<string, string> = {};
    row.cells.forEach((cell: any, i: number) => {
      obj[nodeTable.value.columns[i].name] = cell.data;
    });
    return obj;
  })
);

const renderApi = async () => {
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
    const blocks = data.response.view.pages[0].sections[0];

    // info table
    const infoCols = blocks.info.table.columns;
    const infoCells = blocks.info.table.rows[0].cells;
    infoBlock.value = infoCols.map((col: any, idx: number) => ({
      label: col.name,
      value: infoCells[idx].data,
    }));

    // insight table
    const insightCols = blocks.insight.table.columns;
    const insightCells = blocks.insight.table.rows[0].cells;
    insightBlock.value = insightCols.map((col: any, idx: number) => ({
      label: col.name,
      value: insightCells[idx].data,
    }));

    // nodes table
    const nodeBlock = blocks.blocks.find((b: any) => b.name === "Nodes");
    if (nodeBlock?.table) {
      // Filter out "dashboard" and "connect" columns
      const excludedColumns = ["dashboard", "connect"];

      const filteredColumns = nodeBlock.table.columns.filter(
        (col: any) => !excludedColumns.includes(col.name.toLowerCase())
      );

      const includedIndexes = filteredColumns.map((col: any) =>
        nodeBlock.table.columns.findIndex((c: any) => c.name === col.name)
      );

      const filteredRows = nodeBlock.table.rows.map((row: any) => ({
        ...row,
        cells: includedIndexes.map((idx: number) => row.cells[idx]),
      }));

      nodeTable.value = {
        columns: filteredColumns,
        rows: filteredRows,
      };
    }
  } catch (error) {
    console.error(error);
  }
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
  renderApi();
  intervalId = setInterval(() => {
    renderApi();
  }, 10000);
});
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div>
    <h2>Database Info</h2>
    <div>
      <div v-for="(item, i) in infoBlock" :key="'info-' + i">
        <span>{{ item.label }}</span>
        <span>{{ item.value }}</span>
      </div>
    </div>

    <h2>Database Insights</h2>
    <div>
      <div v-for="(item, i) in insightBlock" :key="'insight-' + i">
        <span>{{ item.label }}</span>
        <span>{{ item.value }}</span>
      </div>
    </div>

    <h2>Node Information</h2>
    <SortableTable
      v-if="nodeTable.columns.length > 0"
      :rows="sortableRows"
      :headers="sortableHeaders"
      :paging="true"
      :rows-per-page="5"
      :table-actions="false"
      :row-actions="false"
    >
      <!-- Optional: slot for row customization -->
      <template
        v-for="header in sortableHeaders"
        #[`col:${header.name}`]="{ row }"
      >
        <td>{{ row[header.name] }}</td>
      </template>
    </SortableTable>
  </div>
</template>
