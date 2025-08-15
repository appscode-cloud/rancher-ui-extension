<script setup lang="ts">
import SortableTable from "@rancher/shell/components/SortableTable/index.vue";
interface Props {
  recentOpsRows: Array<Record<string, string>>;
  recentOpsHeaders: {
    name: any;
    label: any;
    value: any;
    sort: any[];
  }[];
}

const props = withDefaults(defineProps<Props>(), {
  recentOpsRows: () => [],
  recentOpsHeaders: () => [],
});

const rows = props.recentOpsRows.map((ele: Record<string, string>) => {
  const obj = {
    Name: ele.Name,
    Namespace: ele.Role,
    Type: ele["CPU (usage/limit)"],
    Status: ele["Memory (usage/limit)"],
    Age: ele["Storage (usage/limit)"],
  };
  return obj;
});
</script>
<template>
  <SortableTable
    style="margin-top: 36px"
    :rows="rows"
    :headers="props.recentOpsHeaders"
    :paging="true"
    :rows-per-page="5"
    :table-actions="false"
    :row-actions="false"
  >
    <template
      v-for="header in props.recentOpsHeaders"
      #[`col:${header.name}`]="{ row }"
    >
      <td>{{ row[header.name] }}</td>
    </template>
    <template #header-left> <h1>Recent Operations</h1> </template>
  </SortableTable>
</template>
