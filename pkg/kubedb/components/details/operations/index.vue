<script setup lang="ts">
import Tab from "@shell/components/Tabbed/Tab.vue";
import Tabbed from "@shell/components/Tabbed/index.vue";
import ExpandVolume from "./scaling/ExpandVolume.vue";
import Horizontal from "./scaling/Horizontal.vue";
import RecentOperations from "./RecentOperations.vue";
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
</script>
<template>
  <div>
    <Tabbed :sideTabs="true" :use-hash="true" :defaultTab="null">
      <Tab name="recent-ops" label="Operations" weight="2">
        <RecentOperations
          :recent-ops-headers="recentOpsHeaders"
          :recent-ops-rows="recentOpsRows"
        />
      </Tab>
      <Tab name="scaling" label="Scaling" weight="1">
        <Tabbed :sideTabs="true">
          <Tab name="horizontal" label="Horizontal Scale" weight="2">
            <Horizontal />
          </Tab>
          <Tab name="expand-volume" label="Expand Volume" weight="1">
            <ExpandVolume />
          </Tab>
        </Tabbed>
      </Tab>
    </Tabbed>
  </div>
</template>
