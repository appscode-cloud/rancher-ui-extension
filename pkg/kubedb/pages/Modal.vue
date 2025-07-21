<template>
  <div>
    <Dialog
      v-if="showDialog"
      name="example-modal"
      title="Custom Title"
      @okay="handleOkay"
      @closed="showDialog = false"
    >
      <template #default>
        <p>This is a custom modal body. You can put anything here.</p>
        <p>Rancher UI</p>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from '@shell/components/Dialog.vue';

const showDialog = ref(true);

function handleOkay(callback: (ok: boolean) => void) {
  callback(true);
  showDialog.value = false;
}
</script>

<style scoped>
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
</style>
