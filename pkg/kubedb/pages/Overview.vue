<script setup lang="ts">
import { App, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { useNats } from "../composables/nats";
import { useFunctions } from "./PostgresCreate/functions";
import BadgeStateFormatter from "@rancher/shell/components/formatter/BadgeStateFormatter.vue";
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";
import ConsumptionGauge from "@rancher/shell/components/ConsumptionGauge.vue";
import SimpleBox from "@rancher/shell/components/SimpleBox.vue";
import Loading from "@shell/components/Loading.vue";
import { useUtils } from "../composables/utils";

// need to call this on every component.
const { natsConnect } = useNats();
natsConnect(getCurrentInstance()?.appContext.app as App<Element>);

const route = getCurrentInstance()?.proxy?.$route;
const { getPercentage, getClusters, extractNumbers } = useUtils();
const { resourceSummaryCall, genericResourceCall } = useFunctions();

const isLoading = ref(false);
const clusterName = ref("");
const headers = ref<Array<Record<string, any>>>([]);
const rows = ref<Array<Record<string, string>>>([]);
const resourceSummary =
  ref<Array<{ cells: Array<{ data: number | string }> }>>();

const fetchAndSetGenericResources = async (showLoading: boolean) => {
  if (showLoading) isLoading.value = true;
  const tempHeaders: Array<Record<string, any>> = [];
  const tempRows: Array<Record<string, string>> = [];

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
      tempHeaders.push(obj);
    }
  );
  headers.value = tempHeaders;

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
            const pathOnly = cell.link.split("?")[0];
            const segments = pathOnly.split("/").filter(Boolean);
            const resourceNameIndex = segments.length - 1;
            const resourceIndex = resourceNameIndex - 1;
            const versionIndex = resourceNameIndex - 2;
            const groupIndex = resourceNameIndex - 3;
            const group = segments[groupIndex];
            const version = segments[versionIndex];
            const resource = segments[resourceIndex];
            const routePath = route?.path;
            const path = routePath?.replace(/\/overview$/, "");
            obj[
              "link"
            ] = `${path}/${group}/${version}/${resource}/${row.cells[1].data}/${row.cells[0].data}/details`;
          }
        }
      );
      tempRows.push(obj);
    }
  );
  rows.value = tempRows;

  const resourceSummaryResponse = await resourceSummaryCall(clusterName.value);
  resourceSummary.value = resourceSummaryResponse?.values.rows.filter(
    (ele: { cells: Array<{ data: number }> }) => {
      return ele.cells[1].data > 0;
    }
  );
  isLoading.value = false;
};

// Short Pooling
let intervalId: ReturnType<typeof setInterval>;
onMounted(async () => {
  clusterName.value = await getClusters(route?.params.cluster as string);
  await fetchAndSetGenericResources(true);
  intervalId = setInterval(() => {
    fetchAndSetGenericResources(false);
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
      <div class="simple-box-container">
        <SimpleBox
          v-for="resource in resourceSummary"
          :key="resource.cells[0].data"
          :title="`${resource.cells[0].data}: ${resource.cells[1].data} Instance`"
          class="simple-box"
        >
          <ConsumptionGauge
            class="mb-20"
            :capacity="extractNumbers(resource.cells[2].data as string)[1]"
            :used="extractNumbers(resource.cells[2].data as string)[0]"
            units="cores"
            :colorStops="{ 0: '--success', 30: '--warning', 70: '--error' }"
          >
            <template #title>
              <span>
                CPU
                <span class="values text-muted">
                  {{ resource.cells[2].data }}
                </span>
              </span>
              <span>
                {{
                  getPercentage(
                    extractNumbers(resource.cells[2].data as string)[0],
                    extractNumbers(resource.cells[2].data as string)[1]
                  )
                }}
              </span>
            </template>
          </ConsumptionGauge>
          <ConsumptionGauge
            class="mb-20"
            :capacity="extractNumbers(resource.cells[3].data as string)[1]"
            :used="extractNumbers(resource.cells[3].data as string)[0]"
            units="Gi"
            :colorStops="{ 0: '--success', 30: '--warning', 70: '--error' }"
          >
            <template #title>
              <span>
                Memory
                <span class="values text-muted"
                  >{{ resource.cells[3].data }}
                </span>
              </span>
              <span
                >{{
                  getPercentage(
                    extractNumbers(resource.cells[3].data as string)[0],
                    extractNumbers(resource.cells[3].data as string)[1]
                  )
                }}
              </span>
            </template>
          </ConsumptionGauge>
          <ConsumptionGauge
            :capacity="extractNumbers(resource.cells[4].data as string)[1]"
            :used="extractNumbers(resource.cells[4].data as string)[0]"
            units="Gi"
            :colorStops="{ 0: '--success', 30: '--warning', 70: '--error' }"
          >
            <template #title>
              <span>
                Storage
                <span class="values text-muted">
                  {{ resource.cells[4].data }}
                </span>
              </span>
              <span>
                {{
                  getPercentage(
                    extractNumbers(resource.cells[4].data as string)[0],
                    extractNumbers(resource.cells[4].data as string)[1]
                  )
                }}
              </span>
            </template>
          </ConsumptionGauge>
        </SimpleBox>
      </div>
      <SortableTable
        :table-actions="false"
        :row-actions="false"
        :rows="rows"
        :headers="headers"
        paging
        :rowsPerPage="5"
        :loading="isLoading"
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
