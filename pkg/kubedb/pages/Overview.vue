<script setup lang="ts">
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";
import BadgeStateFormatter from "@rancher/shell/components/formatter/BadgeStateFormatter.vue";
import ConsumptionGauge from "@rancher/shell/components/ConsumptionGauge.vue";
import SimpleBox from "@rancher/shell/components/SimpleBox.vue";

function getPercentage(a: number, b: number): string {
  if (b === 0) {
    return "Infinity%";
  }
  const percentage = (a / b) * 100;
  return `${percentage.toFixed(2)}%`;
}

const rows = [
  {
    dbName: "pg1",
    namespace: "demo",
    type: "PostgresSQL",
    mode: "Standalone",
    version: "6.0.12",
    replicas: "1",
    cpu: "900m / 900m",
    memory: "1Gi / 1Gi",
    storage: "2Gi / 2Gi",
    status: "Ready",
    age: 20,
    link: "/",
  },
];

const headers = [
  {
    name: "dbName",
    label: "Database Name",
    value: "dbName",
  },
  {
    name: "type",
    label: "Type",
    value: "type",
  },
  {
    name: "mode",
    label: "Mode",
    value: "mode",
  },
  {
    name: "version",
    label: "Version",
    value: "version",
  },
  {
    name: "replicas",
    label: "Replicas",
    value: "replicas",
  },
  {
    name: "cpu",
    label: "CPU (request/limit)",
    value: "cpu",
  },
  {
    name: "memory",
    label: "Memory (request/limit)",
    value: "memory",
  },
  {
    name: "storage",
    label: "Storage (request/limit)",
    value: "storage",
  },
  {
    name: "status",
    label: "Status",
    value: "status",
  },
  {
    name: "age",
    label: "Age",
    value: "age",
    sort: ["age"],
  },
];
</script>

<template>
  <div>
    <!-- <h1>Hello</h1>
    <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
    <RouterLink :to="`${$route.fullPath}/overview`">Go to Overview</RouterLink>
    <RouterLink :to="`${$route.fullPath}/postgreSQL`"
      >Go to PG-Create</RouterLink
    > -->
    <div class="simple-box-container">
      <SimpleBox title="PostgresSQL" class="simple-box">
        <ConsumptionGauge
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
        </ConsumptionGauge>
      </SimpleBox>
      <SimpleBox title="PostgresSQL" class="simple-box">
        <ConsumptionGauge
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
        </ConsumptionGauge>
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
      :loading="false"
    >
      <template #col:dbName="{ row }">
        <td>
          <router-link :to="row.link">
            {{ row.dbName }}
          </router-link>
        </td>
      </template>
      <template #col:status="{ row }">
        <td>
          <BadgeStateFormatter
            :value="row.status"
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
