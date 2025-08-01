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
import RcButton from "@shell/rancher-components/RcButton/RcButton.vue";

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
            const routePath = route?.path;
            const path = routePath?.replace(/\/overview$/, "");
            obj["link"] = `${path}/${row.cells[2].data.toLowerCase()}/${
              row.cells[1].data
            }/${row.cells[0].data}/details`;
            console.log(obj["link"]);
          }
        }
      );
      tempRows.push(obj);
    }
  );
  rows.value = tempRows;
  console.log({ genericResourceResponse });
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

const connectionError = ref("");
const isNatsConnectionLoading = ref(false);
const simple = true;
const activeTask = ref({
  status: "Success",
  step: "Database created successfully",
  logs: ["The database is ready and live. Everything was set up successfully!"],
});
</script>

<template>
  <div>
    <div v-if="isLoading">
      <Loading />
    </div>
    <div v-else>
      <!-- <div class="simple-box-container">
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
      </SortableTable> -->
      <RcButton
        @click="
          () => {
            connectionError = 'We weren’t able to establish a connection. Please check your network settings and try again.';
          }
        "
        >set error</RcButton
      >
      <RcButton
        @click="
          () => {
            isNatsConnectionLoading = true;
          }
        "
        >set setLoading</RcButton
      >
      <RcButton
        @click="
          () => {
            isNatsConnectionLoading = false;
            connectionError = '';
          }
        "
        >show Data</RcButton
      >
      <div>
        <div v-if="connectionError" class="task-simple-wrapper">
          <div class="task-cogs-icon">
            <i class="fa fa-times-circle has-text-danger fa-5x fa-fw"></i>
          </div>
          <div class="task-log" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div class="task-title">
             <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15.75 15l-6-6m0 6l6-6m7 3c0-5.523-4.477-10-10-10s-10 4.477-10 10s4.477 10 10 10s10-4.477 10-10" color="currentColor"/></svg>
             </span>
            </div>
            <h3 style="margin-top: 8px;"> Connection failed </h3>
            <p>{{ connectionError }}</p>
          </div>
        </div>
        <div
          v-else-if="isNatsConnectionLoading"
          class="is-justify-content-center"
          :class="simple ? 'task-simple-wrapper' : 'task-complex-wrapper'"
        >
          <div :style="{ height: '100%' }" style="display: flex; flex-direction: column; justify-content: center; align-items: center;" class="is-fullheight">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="16" stroke-dashoffset="16" d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path><path stroke-dasharray="64" stroke-dashoffset="64" stroke-opacity=".3" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"/></path></g></svg>
            </span>
            <h3 style="margin-top: 8px;">Loading your data...</h3>
            <p>Please hang on — this won’t take long.</p>
          </div>
        </div>
        <div v-else-if="simple" class="task-simple-wrapper">
          <div class="task-cogs-icon">
            <i class="fa fa-cog fa-spin fa-5x fa-fw"></i>
            <span class="is-flex is-flex-direction-column">
              <i class="fa fa-cog fa-spin fa-3x fa-bw"></i>
              <i class="fa fa-cog fa-spin fa-3x fa-bw"></i>
            </span>
          </div>
          <div class="task-log" style="display: flex; flex-direction: column;justify-content: center; align-items: center;">
            <p class="task-title">
              <span style="display: flex;" v-if="activeTask?.status === 'Running'">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="16" stroke-dashoffset="16" d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path><path stroke-dasharray="64" stroke-dashoffset="64" stroke-opacity=".3" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"/></path></g></svg>
              </span>
          
              <span v-else-if="activeTask?.status === 'Success'">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor"><path d="M17 3.338A9.95 9.95 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10q-.002-1.03-.2-2"/><path d="M8 12.5s1.5 0 3.5 3.5c0 0 5.559-9.167 10.5-11"/></g></svg>
              </span>
           
              <span   v-else-if="activeTask?.status === 'Failed'">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15.75 15l-6-6m0 6l6-6m7 3c0-5.523-4.477-10-10-10s-10 4.477-10 10s4.477 10 10 10s10-4.477 10-10" color="currentColor"/></svg>
              </span>
             
            </p>
             <h3 style="margin-top: 8px;">
                {{ activeTask?.step }}
              </h3>
            <p>{{ activeTask?.logs[activeTask?.logs.length - 1] }}</p>
          </div>
        </div>
      </div>
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
