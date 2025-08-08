<script setup lang="ts">
import RcButton from "@shell/rancher-components/RcButton/RcButton.vue";
import SimpleBox from "@rancher/shell/components/SimpleBox.vue";
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";

interface Props {
  overviewInfoBlock: any[];
  overviewInsightBlock: any[];
  overviewNodeTable: {
    columns: any[];
    rows: any[];
  };
  overviewSortableRows: Array<Record<string, string>>;
  overviewSortableHeaders: {
    name: any;
    label: any;
    value: any;
    sort: any[];
  }[];
  singleDbDelete?: () => Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  overviewInfoBlock: () => [],
  overviewInsightBlock: () => [],
  overviewNodeTable: () => ({
    columns: [],
    rows: [],
  }),
  overviewSortableRows: () => [],
  overviewSortableHeaders: () => [],
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
        <h2>Database Info</h2>
        <RcButton danger @click="singleDbDelete">Delete</RcButton>
      </div>
      <div v-for="(item, i) in overviewInfoBlock" :key="'info-' + i">
        <div
          style="
            display: flex;
            align-items: start;
            gap: 8px;
            margin-bottom: 16px;
          "
        >
          <strong style="min-width: 150px">{{ item.label }}:</strong>

          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 36px">
      <h2 style="margin-bottom: 16px; display: flex">Database Insights</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        <div
          class="simple-box-container"
          v-for="(item, i) in overviewInsightBlock"
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
      style="margin-top: 36px"
      v-if="overviewNodeTable.columns.length > 0"
      :rows="overviewSortableRows"
      :headers="overviewSortableHeaders"
      :paging="true"
      :rows-per-page="5"
      :table-actions="false"
      :row-actions="false"
    >
      <template
        v-for="header in overviewSortableHeaders"
        #[`col:${header.name}`]="{ row }"
      >
        <td>{{ row[header.name] }}</td>
      </template>
      <template #header-left>
        <h1>Nodes</h1>
      </template>
    </SortableTable>
  </div>
</template>
