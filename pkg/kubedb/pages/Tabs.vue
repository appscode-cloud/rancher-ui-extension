<template>
  <div class="simple-tabs">
    <ul class="tab-list">
      <li
        v-for="tab in tabs"
        :key="tab.name"
        :class="{ active: tab.active, disabled: tab.disabled }"
        @click="select(tab.name)"
      >
        {{ tab.labelDisplay }}
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </li>
    </ul>

    <div class="tab-content">
      <div v-for="tab in tabs" :key="tab.name" v-show="tab.active">
        <h3>{{ tab.labelDisplay }} Content</h3>
        <p>This is dummy content for the {{ tab.labelDisplay }} tab.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  name: string;
  labelDisplay: string;
  active: boolean;
  disabled?: boolean;
  badge?: number;
}

const tabs = ref<Tab[]>([
  {
    name: 'cluster-events',
    labelDisplay: 'Events',
    active: true,
    badge: 0,
  },
  {
    name: 'cluster-certs',
    labelDisplay: 'Certificates',
    active: false,
    badge: 0,
  }
]);

function select(name: string) {
  tabs.value.forEach(tab => {
    tab.active = tab.name === name;
  });
}
</script>

<style scoped>
.simple-tabs {
  font-family: sans-serif;
}

.tab-list {
  list-style: none;
  display: flex;
  gap: 16px;
  padding: 0;
  border-bottom: 2px solid #ccc;
  margin-bottom: 16px;
}

.tab-list li {
  cursor: pointer;
  padding: 8px 16px;
  border-bottom: 2px solid transparent;
}

.tab-list li.active {
  border-bottom: 2px solid #42b983;
  font-weight: bold;
}

.tab-list li.disabled {
  color: #aaa;
  cursor: not-allowed;
}

.badge {
  margin-left: 8px;
  background: #007bff;
  color: white;
  border-radius: 12px;
  padding: 0 6px;
  font-size: 12px;
}

.tab-content {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 6px;
}
</style>
