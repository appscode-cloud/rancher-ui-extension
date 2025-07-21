<script setup lang="ts">
import { computed, defineProps, ref } from "vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import UnitInput from "@rancher/shell/components/form/UnitInput.vue";
import RadioGroup from "@rancher/shell/rancher-components/Form/Radio/RadioGroup.vue";
import {
  NameSpacesType,
  NameType,
  VersionType,
  ModeType,
  ReplicaType,
  MachineType,
  CPUType,
  MemoryType,
  StorageSizeType,
  StorageClassType,
  RemoteReplicaType,
} from "../types/type";

interface Props {
  NameSpacesProps: NameSpacesType;
  required: (value: unknown) => string;
  VersionsProps: VersionType;
  NameProps: NameType;
  StorageSizeProps: StorageSizeType;
  StorageClassProps: StorageClassType;
  ReplicaProps: ReplicaType;
  MachineProps: MachineType;
  CPUProps: CPUType;
  MemoryProps: MemoryType;
  ModeProps: ModeType;
  RemoteReplicaProps: RemoteReplicaType;
}

const props = defineProps<Props>();
const isCustom = computed(() => {
  return props.MachineProps.machineModel === "custom";
});

const showReplicas = computed(() => {
  return props.ModeProps.modeModel === "Cluster" && props.ReplicaProps.show;
});
const showRemoteReplica = computed(() => {
  return props.ModeProps.modeModel === "RemoteReplica";
});
</script>

<template>
  <div>
    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-if="props.VersionsProps.show"
          v-model:value="props.VersionsProps.versionModel"
          :clearable="props.VersionsProps.clearable"
          :options="props.VersionsProps.options"
          :disabled="props.VersionsProps.disabled"
          :searchable="props.VersionsProps.searchable"
          :multiple="props.VersionsProps.multiple"
          :label="props.VersionsProps.label"
          :placeholder="props.VersionsProps.placeholder"
          :required="props.VersionsProps.required"
          :rules="props.VersionsProps.rules"
        />
      </div>
      <div class="col span-6">
        <RadioGroup
          v-if="props.ModeProps.show"
          v-model:value="props.ModeProps.modeModel"
          :label="props.ModeProps.label"
          :options="props.ModeProps.options"
          :row="props.ModeProps.row"
        />
      </div>
    </div>

    <div class="mb-20">
      <LabeledInput
        v-if="showReplicas"
        v-model:value="props.ReplicaProps.replicaModel"
        type="number"
        :label="props.ReplicaProps.label"
        :placeholder="props.ReplicaProps.placeholder"
        :min-height="props.ReplicaProps.minHeight"
        :required="showReplicas"
        :rules="showReplicas ? props.ReplicaProps.rules : []"
      />
      <LabeledSelect
        v-if="showRemoteReplica && props.RemoteReplicaProps.show"
        v-model:value="props.RemoteReplicaProps.remoteReplicaModel"
        :options="props.RemoteReplicaProps.options"
        :disabled="props.RemoteReplicaProps.disabled"
        :label="props.RemoteReplicaProps.label"
        :placeholder="props.RemoteReplicaProps.placeholder"
        :required="showRemoteReplica"
        :rules="props.RemoteReplicaProps.rules"
      />
    </div>

    <div class="mb-20">
      <LabeledSelect
        v-if="props.MachineProps.show"
        v-model:value="props.MachineProps.machineModel"
        :options="props.MachineProps.options"
        :searchable="props.MachineProps.searchable"
        :multiple="props.MachineProps.multiple"
        :label="props.MachineProps.label"
        :placeholder="props.MachineProps.placeholder"
        :required="props.MachineProps.required"
      />
    </div>

    <div class="row mb-20" v-if="isCustom && props.CPUProps.show">
      <div class="col span-6">
        <UnitInput
          v-model:value="props.CPUProps.cpuModel"
          :placeholder="props.CPUProps.placeholder"
          :label="props.CPUProps.label"
          :base-unit="props.CPUProps.baseUnit"
          :required="isCustom ? true : false"
          :min="props.CPUProps.min"
        />
      </div>
      <div class="col span-6">
        <UnitInput
          v-model:value="props.MemoryProps.memoryModel"
          :placeholder="props.MemoryProps.placeholder"
          :label="props.MemoryProps.label"
          :base-unit="props.MemoryProps.baseUnit"
          :required="isCustom ? true : false"
          :min="props.MemoryProps.min"
        />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-if="props.StorageClassProps.show"
          v-model:value="props.StorageClassProps.storageClassModel"
          :options="props.StorageClassProps.options"
          :searchable="props.StorageClassProps.searchable"
          :multiple="props.StorageClassProps.multiple"
          :label="props.StorageClassProps.label"
          :placeholder="props.StorageClassProps.placeholder"
          :required="props.StorageClassProps.required"
        />
      </div>
      <div v-if="props.StorageSizeProps.show" class="col span-6">
        <LabeledInput
          v-model:value="props.StorageSizeProps.storageSizeModel"
          :label="props.StorageSizeProps.label"
          :disabled="props.StorageSizeProps.disabled"
          :min-height="props.StorageSizeProps.minHeight"
          :required="props.StorageSizeProps.required"
          :placeholder="props.StorageSizeProps.placeholder"
          :rules="props.StorageSizeProps.rules"
        />
      </div>
    </div>
  </div>
</template>
