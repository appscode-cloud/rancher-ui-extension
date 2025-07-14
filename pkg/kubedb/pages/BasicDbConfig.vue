<script setup lang="ts">
import { computed, defineEmits, defineProps, toRefs } from "vue";
import { useField } from "vee-validate";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import UnitInput from "@rancher/shell/components/form/UnitInput.vue";
import RadioGroup from "@rancher/shell/rancher-components/Form/Radio/RadioGroup.vue";
import { platform } from "@shell/utils/platform";
import type {genericOption} from "../types/type"

interface Props {
  genericNameSpaces: genericOption;
  required: (value: unknown) => string;
  genericVersions: genericOption;
  genericName: genericOption;
  genericStorageSize: genericOption;
  genericStorageClass: genericOption;
  genericReplica: genericOption;
  genericMachine: genericOption;
  genericCPU: genericOption;
  genericMemory: genericOption;
  genericMode: genericOption;
}

const props = defineProps<Props>()
const isCustom = computed(() => {
  return props.genericMachine.machineModel === "custom";
});

const showReplicas = computed(() => {
  return props.genericMode.modeModel !== "standalone";
});
</script>

<template>
  <div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-if="props.genericNameSpaces.show"
          v-model:value="props.genericNameSpaces.namespaceModel"
          :clearable="props.genericNameSpaces.clearable"
          :options="props.genericNameSpaces.options"
          :disabled="props.genericNameSpaces.disabled"
          :searchable="props.genericNameSpaces.searchable"
          :multiple="props.genericNameSpaces.multiple"
          :label="props.genericNameSpaces.label"
          :placeholder="props.genericNameSpaces.placeholder"
          :required="props.genericNameSpaces.required"
          :rules="props.genericNameSpaces.rules"
        />
      </div>

      <div class="col span-6">
        <LabeledInput
          v-if="props.genericName.show"
          v-model:value="props.genericName.nameModel"
          :label="props.genericName.label"
          :placeholder="props.genericName.placeholder"
          :disabled="props.genericName.disabled"
          :min-height="props.genericName.minHeight"
          :required="props.genericName.required"
          :rules="props.genericName.rules"
        />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-if="props.genericVersions.show"
          v-model:value="props.genericVersions.versionModel"
          :clearable="props.genericVersions.clearable"
          :options="props.genericVersions.options"
          :disabled="props.genericVersions.disabled"
          :searchable="props.genericVersions.searchable"
          :multiple="props.genericVersions.multiple"
          :label="props.genericVersions.label"
          :placeholder="props.genericVersions.placeholder"
          :required="props.genericVersions.required"
          :rules="props.genericVersions.rules"
        />
      </div>
      <div class="col span-6">
        <RadioGroup
          v-if="props.genericMode.show"
          v-model:value="props.genericMode.modeModel"
          :label="props.genericMode.label"
          :options="props.genericMode.options"
          :row="props.genericMode.row"
        />
      </div>
    </div>

    <div class="mb-20">
      <LabeledInput
        v-if="showReplicas && props.genericReplica.show"
        v-model:value="props.genericReplica.replicaModel"
        type="number"
        :label="props.genericReplica.label"
        :placeholder="props.genericReplica.placeholder"
        :min-height="props.genericReplica.minHeight"
      />
    </div>

    <div class="mb-20">
      <LabeledSelect 
        v-if="props.genericMachine.show"
        v-model:value="props.genericMachine.machineModel"
        :options="props.genericMachine.options"
        :searchable="props.genericMachine.searchable"
        :multiple="props.genericMachine.multiple"
        :label="props.genericMachine.label"
        :placeholder="genericMachine.placeholder"
      />
    </div>

    <div class="row mb-20" v-if="isCustom && props.genericCPU.show">
      <div class="col span-6">
        <UnitInput
          v-model:value="props.genericCPU.cpuModel"
          :placeholder="props.genericCPU.placeholder"
          :label="props.genericCPU.label"
          :base-unit="props.genericCPU.baseUnit"
          :required="isCustom ? true : false"
          :min="props.genericCPU.min"
        />
      </div>
      <div class="col span-6">
        <UnitInput
          v-model:value="props.genericMemory.memoryModel"
          :placeholder="props.genericMemory.placeholder"
          :label="props.genericMemory.label"
          :base-unit="props.genericMemory.baseUnit"
          :required="isCustom ? true : false"
          :min="props.genericMemory.min"
        />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-if = "props.genericStorageClass.show"
          v-model:value="props.genericStorageClass.storageClassModel"
          :options="props.genericStorageClass.options"
          :searchable="props.genericStorageClass.searchable"
          :multiple="props.genericStorageClass.multiple"
          :label="props.genericStorageClass.label"
          :placeholder="props.genericStorageClass.placeholder"
          :required="props.genericStorageClass.required"
        />
      </div>
      <div v-if="props.genericStorageSize.show" class="col span-6">
        <LabeledInput
          v-model:value="props.genericStorageSize.storageSizeModel"
          :label="props.genericStorageSize.label"
          :disabled="props.genericStorageSize.disabled"
          :min-height="props.genericStorageSize.minHeight"
          :required="props.genericStorageSize.required"
          :placeholder="props.genericStorageSize.placeholder"
          :rules="props.genericStorageSize.rules"
        />
      </div>
    </div>
  </div>
</template>
