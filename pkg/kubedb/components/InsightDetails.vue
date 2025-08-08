<script setup lang="ts">
import SimpleBox from "@rancher/shell/components/SimpleBox.vue";
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";

interface Props {
  insightInfoBlock: any[];
  insightInsightBlock: any[];
  insightReplicationStatusTable: {
    columns: any[];
    rows: any[];
  };
  insightReplicationStatusRows: Record<string, string>[];
  insightReplicationStatusHeaders: {
    name: any;
    label: any;
    value: any;
    sort: never[];
  }[];
  insightGrafanaDashboardRows: Record<string, string>[];
  insightSlowQueriesTable: {
    columns: any[];
    rows: any[];
  };
  insightSlowQueriesRows: Record<string, string>[];
  insightSlowQueriesHeaders: {
    name: any;
    label: any;
    value: any;
    sort: never[];
  }[];
  insightDatabasesTable: {
    columns: any[];
    rows: any[];
  };
  insightDatabasesRows: Record<string, string>[];
  insightDatabasesHeaders: {
    name: any;
    label: any;
    value: any;
    sort: never[];
  }[];
}

const props = withDefaults(defineProps<Props>(), {
  insightInfoBlock: () => [],
  insightInsightBlock: () => [],
  insightReplicationStatusTable: () => ({
    columns: [],
    rows: [],
  }),
  insightReplicationStatusRows: () => [],
  insightReplicationStatusHeaders: () => [],
  insightGrafanaDashboardRows: () => [],
  insightSlowQueriesTable: () => ({
    columns: [],
    rows: [],
  }),
  insightSlowQueriesRows: () => [],
  insightSlowQueriesHeaders: () => [],
  insightDatabasesTable: () => ({
    columns: [],
    rows: [],
  }),
  insightDatabasesRows: () => [],
  insightDatabasesHeaders: () => [],
});
</script>
<template>
  <div class="tab-content">
    <div>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <h2>Basic Info</h2>
      </div>
      <div v-if="insightInfoBlock.length !== 0">
        <div v-for="(item, i) in insightInfoBlock" :key="'info-' + i">
          <div
            style="
              display: flex;
              align-items: start;
              gap: 8px;
              margin-bottom: 16px;
            "
          >
            <strong style="min-width: 150px">{{ item.label }}:</strong>
            <span>{{ item.value ? item.value : "-" }}</span>
          </div>
        </div>
      </div>
      <div v-else>No Data to show</div>
    </div>

    <div style="margin-top: 36px">
      <h2 style="margin-bottom: 16px; display: flex">Database Insights</h2>
      <div v-if="insightInsightBlock.length !== 0">
        <div style="display: flex; flex-wrap: wrap; gap: 16px">
          <div
            class="simple-box-container"
            v-for="(item, i) in insightInsightBlock"
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
      <div v-else>No Data to show</div>
    </div>

    <SortableTable
      style="margin-top: 36px"
      v-if="insightReplicationStatusTable.columns.length > 0"
      :rows="insightReplicationStatusRows"
      :headers="insightReplicationStatusHeaders"
      :paging="true"
      :rows-per-page="5"
      :table-actions="false"
      :row-actions="false"
    >
      <template
        v-for="header in insightReplicationStatusHeaders"
        #[`col:${header.name}`]="{ row }"
      >
        <td>{{ row[header.name] }}</td>
      </template>
      <template #header-left>
        <h1>Replication Status</h1>
      </template>
    </SortableTable>

    <div v-if="insightGrafanaDashboardRows.length !== 0">
      <div
        style="
          display: flex;
          margin-top: 36px;
          justify-content: space-between;
          align-items: center;
        "
      >
        <h2>Grafana Dashboards</h2>
      </div>
      <ul>
        <li v-for="value in insightGrafanaDashboardRows" :key="value.URL">
          <a :href="value.URL" target="_blank">{{ value.Title }}</a>
        </li>
      </ul>
    </div>
    <SortableTable
      style="margin-top: 36px"
      v-if="insightSlowQueriesTable.columns.length > 0"
      :rows="insightSlowQueriesRows"
      :headers="insightSlowQueriesHeaders"
      :paging="true"
      :rows-per-page="5"
      :table-actions="false"
      :row-actions="false"
    >
      <template
        v-for="header in insightSlowQueriesHeaders"
        #[`col:${header.name}`]="{ row }"
      >
        <td>{{ row[header.name] }}</td>
      </template>
      <template #header-left>
        <h1>Slow Queries</h1>
      </template>
    </SortableTable>

    <SortableTable
      style="margin-top: 36px"
      v-if="insightDatabasesTable.columns.length > 0"
      :rows="insightDatabasesRows"
      :headers="insightDatabasesHeaders"
      :paging="true"
      :rows-per-page="5"
      :table-actions="false"
      :row-actions="false"
    >
      <template
        v-for="header in insightDatabasesHeaders"
        #[`col:${header.name}`]="{ row }"
      >
        <td>{{ row[header.name] }}</td>
      </template>
      <template #header-left>
        <h1>Databases</h1>
      </template>
    </SortableTable>
  </div>
</template>
