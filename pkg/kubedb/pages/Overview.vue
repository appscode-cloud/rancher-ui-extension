<script setup lang="ts">
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";
import BadgeStateFormatter from "@rancher/shell/components/formatter/BadgeStateFormatter.vue";
import ConsumptionGauge from "@rancher/shell/components/ConsumptionGauge.vue";
import Loading from "@shell/components/Loading.vue";
import SimpleBox from "@rancher/shell/components/SimpleBox.vue";
import { useFunctions } from "./PostgresCreate/functions";
import { App, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import { useNats } from "../composables/nats";

// need to call this on every component.
const { natsConnect } = useNats();
natsConnect(getCurrentInstance()?.appContext.app as App<Element>);

const store = useStore();
const clusterName = ref("");
const route = getCurrentInstance()?.proxy?.$route;
const params = route?.params;

const { resourceSummaryCall, genericResourceCall } = useFunctions();

const isLoading = ref(false);

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
      if (ele.id === params?.cluster) {
        clusterName.value = ele.spec.displayName;
      }
    });
  } catch (e) {
    console.log(e);
  }
};

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
            obj["link"] = cell.link;
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

function extractNumbers(input: string): [number, number] {
  const matches = input.match(/\d+/g);

  if (!matches || matches.length !== 2) {
    throw new Error("Input string must contain exactly two numbers");
  }

  return [parseInt(matches[0], 10), parseInt(matches[1], 10)];
}

let intervalId: ReturnType<typeof setInterval>;
onMounted(async () => {
  await getClusters();
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
