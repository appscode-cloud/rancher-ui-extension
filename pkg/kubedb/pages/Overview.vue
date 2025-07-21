<script setup lang="ts">
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";
import BadgeStateFormatter from "@rancher/shell/components/formatter/BadgeStateFormatter.vue";
import ConsumptionGauge from "@rancher/shell/components/ConsumptionGauge.vue";
import SimpleBox from "@rancher/shell/components/SimpleBox.vue";
import { useFunctions } from "./PostgresCreate/functions";
import { onMounted, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const clusterName = ref("");
const { params } = useRoute();

const {
  genericResourceLoading,
  resourceSummaryLoading,
  resourceSummaryCall,
  genericResourceCall,
} = useFunctions();

function getPercentage(a: number, b: number): string {
  if (b === 0) {
    return "Infinity%";
  }
  const percentage = (a / b) * 100;
  return `${percentage.toFixed(2)}%`;
}

const headers = ref<Array<Record<string, any>>>([]);
const rows = ref<Array<Record<string, string>>>([]);
const resourceSummary =
  ref<Array<{ cells: Array<{ data: number | string }> }>>();

const getClusters = async () => {
  try {
    const result = await store.dispatch("management/findAll", {
      type: "management.cattle.io.cluster",
    });
    result.forEach((ele: { id: string; spec: { displayName: string } }) => {
      if (ele.id === params.cluster) {
        clusterName.value = ele.spec.displayName;
      }
    });
  } catch (e) {
    console.log(e);
  }
};

onMounted(async () => {
  await getClusters();
  const genericResourceResponse = await genericResourceCall(clusterName.value);
  genericResourceResponse?.values.columns.forEach(
    (col: { name: string; sort: { enable: boolean }; link: boolean }) => {
      const obj: {
        name: string;
        value: string;
        label: string;
        sort?: Array<string>;
      } = {
        name: col.name,
        value: col.name,
        label: col.name,
      };
      if (col?.sort?.enable) obj.sort = [col.name];
      headers.value.push(obj);
    }
  );
  genericResourceResponse?.values.rows.forEach(
    (row: {
      cells: Array<{
        data: string;
        link: string;
        color: string;
        sort: string;
      }>;
      namespace: string;
    }) => {
      const obj: Record<string, string> = {};
      row.cells.forEach(
        (
          cell: {
            data: string;
            link: string;
            color: string;
            sort: string;
          },
          index: number
        ) => {
          const key = headers.value[index].name;
          const value = cell.data;
          obj[key] = value;
          if (cell.link) {
            obj["link"] = cell.link;
          }
        }
      );
      rows.value.push(obj);
    }
  );

  const resourceSummaryResponse = await resourceSummaryCall(clusterName.value);
  resourceSummary.value = resourceSummaryResponse?.values.rows.filter(
    (ele: { cells: Array<{ data: number }> }) => {
      return ele.cells[1].data > 0;
    }
  );
});
</script>

<template>
  <div>
    <div v-if="genericResourceLoading || resourceSummaryLoading">
      Loading...
    </div>
    <div v-else>
      <div class="simple-box-container">
        <SimpleBox
          v-for="resource in resourceSummary"
          :key="resource.cells[0].data"
          :title="resource.cells[0].data"
          class="simple-box"
        >
          <!-- <ConsumptionGauge
            class="mb-20"
            :capacity="16"
            :used="8"
            units="cores"
            :colorStops="{ 0: '--success', 30: '--warning', 70: '--error' }"
          >
            <template #title>
              <span>
                CPU
                <span class="values text-muted"> 8/16 cores </span>
              </span>
              <span> {{ getPercentage(8, 16) }} </span>
            </template>
          </ConsumptionGauge>
          <ConsumptionGauge
            class="mb-20"
            :capacity="4"
            :used="1"
            units="Gi"
            :colorStops="{ 0: '--success', 30: '--warning', 70: '--error' }"
          >
            <template #title>
              <span>
                Memory
                <span class="values text-muted"> 1/4 Gi </span>
              </span>
              <span> {{ getPercentage(1, 4) }} </span>
            </template>
          </ConsumptionGauge>
          <ConsumptionGauge
            :capacity="31"
            :used="30"
            units="Gi"
            :colorStops="{ 0: '--success', 30: '--warning', 70: '--error' }"
          >
            <template #title>
              <span>
                Storage
                <span class="values text-muted"> 30/31 Gi </span>
              </span>
              <span> {{ getPercentage(30, 31) }} </span>
            </template>
          </ConsumptionGauge> -->
          <div>
            <div>
              <p>{{ resource.cells[1].data }}</p>
            </div>
            <div>
              <p>CPU: {{ resource.cells[2].data }}</p>
              <p>MEMORY: {{ resource.cells[3].data }}</p>
              <p>STORAGE: {{ resource.cells[4].data }}</p>
            </div>
          </div>
        </SimpleBox>
      </div>
      <SortableTable
        default-sort-by="error"
        :table-actions="false"
        :row-actions="false"
        :rows="rows"
        :headers="headers"
        paging
        :rowsPerPage="5"
        :loading="genericResourceLoading"
      >
        <template #col:Name="{ row }">
          <td>
            <router-link :to="row.link">
              {{ row.Name }}
            </router-link>
          </td>
        </template>
        <template #col:Status="{ row }">
          <td>
            <BadgeStateFormatter
              :value="row.Status"
              :row="rows"
              :col="headers"
              :arbitrary="true"
            />
          </td>
        </template>
        <template #header-left>
          <h1>Overview</h1>
        </template>
      </SortableTable>
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
