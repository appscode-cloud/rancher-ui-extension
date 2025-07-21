
<template>
  <div>
    <button class="btn role-primary" @click="showDialog = true">
      Open Modal
    </button>

    <Dialog
      v-if="showDialog"
      name="example-modal"
      title="Custom Title"
      @okay="handleOkay"
      @closed="showDialog = false"
    >
      <template #default>
        <p>This is a custom modal body. You can put anything here.</p>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from '@shell/components/Dialog.vue';

const showDialog = ref(false);
const lastResult = ref(null);


function handleOkay(callback: (ok: boolean) => void) {
  callback(true); 
  showDialog.value = false; 
}
</script>

<style scoped>
.dialog-container {
  padding: 24px;
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.btn {
  padding: 10px 20px;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

.dialog-content {
  padding: 16px;
  font-size: 14px;
}

.result {
  margin-top: 24px;
  padding: 16px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: left;
}
</style>
