<template>
  <div class="container">
    <h1>Using Rancher's Tabbed Component</h1>
    
    <Tabbed
      class="mb-20"
      :use-hash="true"
      :default-tab="'overview'"
    >
      <Tab
        name="overview"
        label="Overview"
        :weight="10"
      >
        <div class="tab-content">
          <h3>Cluster Overview</h3>
          <p>Total Nodes: 3</p>
          <p>Active Nodes: 2</p>
        </div>
      </Tab>
      
      <Tab
        name="config"
        label="Configuration"
        :weight="20"
        :badge="3"
      >
        <div class="tab-content">
          <h3>Configuration Items</h3>
          <ul>
            <li>CPU Limit: 2 cores</li>
            <li>Memory Limit: 4GB</li>
            <li>Storage: 100GB</li>
          </ul>
        </div>
      </Tab>
      
      <Tab
        name="logs"
        label="Logs"
        :weight="30"
        :error="true"
      >
        <div class="tab-content">
          <h3>System Logs</h3>
          <div class="error-message">
            Warning: There are errors in the logs
          </div>
          <pre>[2024-01-15 10:30:00] INFO: System started
[2024-01-15 10:30:01] INFO: Nodes initialized
[2024-01-15 10:30:02] WARNING: High memory usage detected
[2024-01-15 10:30:03] INFO: All services running</pre>
        </div>
      </Tab>
    </Tabbed>
  </div>
</template>

<script>
import Tabbed from '@shell/components/Tabbed/index.vue';
import Tab from '@shell/components/Tabbed/Tab.vue';

export default {
  name: 'MyApp',
  components: {
    Tabbed,
    Tab
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
