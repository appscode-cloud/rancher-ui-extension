<script setup lang="ts">
import Tab from "@shell/components/Tabbed/Tab.vue";
import Tabbed from "@shell/components/Tabbed/index.vue";
import ExpandVolume from "./scaling/ExpandVolume.vue";
import Horizontal from "./scaling/Horizontal.vue";
import RecentOperations from "./RecentOperations.vue";
import UpdateVersion from "./operation/UpdateVersion.vue";
import Restart from "./operation/Restart.vue";
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
      <Tab name="recent-ops" label="Recent Operations" weight="6">
        <div class="tab-content">
          <RecentOperations
            :recent-ops-headers="recentOpsHeaders"
            :recent-ops-rows="recentOpsRows"
          />
        </div>
      </Tab>
      <Tab name="operations" label="Operations" weight="5">
        <Tabbed :sideTabs="true">
          <Tab name="update-version" label="Update Version" weight="3">
            <UpdateVersion />
          </Tab>
          <Tab name="restart" label="Restart" weight="2">
            <Restart />
          </Tab>
        </Tabbed>
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
