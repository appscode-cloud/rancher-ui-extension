<script setup lang="ts">
import { ref } from "vue";
import Restore from "./backups/Restore.vue";
import Restart from "./operation/Restart.vue";
import Horizontal from "./scaling/Horizontal.vue";
import Tab from "@shell/components/Tabbed/Tab.vue";
import RecentOperations from "./RecentOperations.vue";
import ExpandVolume from "./scaling/ExpandVolume.vue";
import Tabbed from "@shell/components/Tabbed/index.vue";
import InstantBackup from "./backups/InstantBackup.vue";
import UpdateVersion from "./operation/UpdateVersion.vue";

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

const tabChanged = ref(false);
</script>
<template>
  <div>
    <Tabbed
      :sideTabs="true"
      :use-hash="true"
      :defaultTab="null"
      @changed="tabChanged = !tabChanged"
    >
      <Tab name="recent-ops" label="Recent Operations" weight="6">
        <div class="tab-content">
          <RecentOperations
            :recent-ops-headers="recentOpsHeaders"
            :recent-ops-rows="recentOpsRows"
          />
        </div>
      </Tab>
      <!-- <Tab name="backups" label="Backups" weight="5">
        <Tabbed :sideTabs="true">
          <Tab name="instant-backup" label="Instant Backup" weight="2">
            <InstantBackup />
          </Tab>
          <Tab name="restore" label="Restore" weight="2">
            <Restore />
          </Tab>
        </Tabbed>
      </Tab> -->
      <Tab name="operations" label="Operations" weight="5">
        <Tabbed :sideTabs="true" @changed="tabChanged = !tabChanged">
          <!-- <Tab name="update-version" label="Update Version" weight="3">
            <UpdateVersion />
          </Tab> -->
          <Tab name="restart" label="Restart" weight="2">
            <Restart :is-tab-changed="tabChanged" />
          </Tab>
        </Tabbed>
      </Tab>
      <Tab name="scaling" label="Scaling" weight="1">
        <Tabbed :sideTabs="true" @changed="tabChanged = !tabChanged">
          <Tab name="horizontal" label="Horizontal Scale" weight="2">
            <Horizontal :is-tab-changed="tabChanged" />
          </Tab>
          <Tab name="expand-volume" label="Expand Volume" weight="1">
            <ExpandVolume :is-tab-changed="tabChanged" />
          </Tab>
        </Tabbed>
      </Tab>
    </Tabbed>
  </div>
</template>
