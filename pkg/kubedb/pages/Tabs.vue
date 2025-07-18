<template>
  <div class="container">
    <Tabbed class="mb-20" :default-tab="defaultTab" :use-hash="true">
      <Tab
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :label="tab.label"
        :weight="tab.weight"
        :badge="tab.badge"
        :error="tab.error"
      >
        <div class="tab-content">
          <h3>{{ tab.label }} Content</h3>
          <p>This is a placeholder for the <strong>{{ tab.name }}</strong> tab.</p>
        </div>
      </Tab>
    </Tabbed>
  </div>
</template>

<script setup lang="ts">
import Tabbed from '@shell/components/Tabbed/index.vue'
import Tab from '@shell/components/Tabbed/Tab.vue'

interface TabItem {
  name: string
  label: string
  weight?: number
  badge?: number
  error?: boolean
}

const props = withDefaults(defineProps<{
  tabs?: TabItem[]
  defaultTab?: string
}>(), {
  tabs: () => ([
    { name: 'overview', label: 'Overview', weight: 10,badge: 4 },
    { name: 'config', label: 'Configuration', weight: 20, badge: 2 },
    { name: 'logs', label: 'Logs', weight: 30, error: false, badge: 9 }
  ]),
  defaultTab: 'overview'
})
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
