<script setup lang="ts">
import { computed, defineEmits, defineProps, toRefs } from "vue";
import { useField } from "vee-validate";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import UnitInput from "@rancher/shell/components/form/UnitInput.vue";
import RadioGroup from "@rancher/shell/rancher-components/Form/Radio/RadioGroup.vue";
import { platform } from "@shell/utils/platform";

type genericOption = {
  show?: boolean;
  disabled?: boolean;
  options?: Array<{
    label: string;
    value: string;
  }>;
  searchable?: boolean;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
  rules?: Array<(value: unknown) => string>;
  clearable?: boolean;
  label?: string;
  minHeight?: number;
  namespaceModel?: string;
  nameModel?: string;
  versionModel?: string;
  storageSizeModel?: string;
  storageClassModel?: string;
};

interface Props {
  genericNameSpaces?: genericOption;
  databaseModes: string[];
  machines: string[];
  required: (value: unknown) => string;
  genericVersions?: genericOption;
  genericName?: genericOption;
  genericStorageSize?: genericOption;
  genericStorageClass?: genericOption;
}

const props = withDefaults(defineProps<Props>(), {
  genericNameSpaces: () => ({
    show: true,
    disabled: false,
    options: [],
    searchable: true,
    multiple: false,
    label: "Namespace",
    placeholder: "Select Namespace",
    required: true,
    rules: [(value) => (value ? "" : "Namespace is required")],
    clearable: true,
    namespaceModel: "Namespaces",
  }),
  genericVersions: () => ({
    show: true,
    disabled: false,
    options: [],
    searchable: true,
    multiple: false,
    label: "Version",
    placeholder: "Select Version",
    required: true,
    rules: [(value) => (value ? "" : "Version is required")],
    clearable: true,
    versionModel: "Version",
  }),
  genericName: () => ({
    show: true,
    disabled: false,
    label: "Name",
    placeholder: "Database Name",
    required: true,
    rules: [(value) => (value ? "" : "Name is required")],
    minHeight: 30,
    nameModel: "Name",
  }),
  genericStorageSize: () => ({
    show: true,
    disabled: false,
    label: "Storage Size",
    placeholder: "Storage Size",
    required: true,
    rules: [(value) => (value ? "" : "Storage Size is required")],
    minHeight: 30,
    storageSizeModel: "20",
  }),
  genericStorageClass: () => ({
    show: true,
    disable: false,
    label: "Storage Class",
    placeholder: "Select Storage Class",
    required: true,
    rules: [(value) => (value ? "" : "Storage class is required")],
    searchable: true,
    options: [],
    multiple: false,
  }),
});

const { value: replicas } = useField<string>("replicas");
const { value: machine } = useField<string>("machine");
const { value: cpu } = useField<string>("cpu");
const { value: memory } = useField<string>("memory");
const { value: mode } = useField<string>("mode", "", {
  initialValue: "standalone",
});

const isCustom = computed(() => {
  return machine.value === "custom";
});

const showReplicas = computed(() => {
  return mode.value !== "standalone";
});

const updateMode = (value: string) => {
  mode.value = value;
};
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
          :value="mode"
          name="database-mode"
          label="Database Mode"
          :options="databaseModes"
          :row="true"
          @update:value="updateMode"
        />
      </div>
    </div>

    <div class="mb-20">
      <LabeledInput
        v-if="showReplicas"
        v-model:value="replicas"
        type="number"
        label="Replicas"
        placeholder=""
        :min-height="30"
      />
    </div>

    <div class="mb-20">
      <LabeledSelect
        v-model:value="machine"
        :options="machines"
        :searchable="true"
        :multiple="false"
        label="Machine Profile"
        placeholder="Select machine"
      />
    </div>

    <div class="row mb-20" v-if="isCustom">
      <div class="col span-6">
        <UnitInput
          v-model:value="cpu"
          placeholder="cpu limits"
          label="CPU"
          base-unit="core"
          :required="isCustom ? true : false"
          :min="0"
        />
      </div>
      <div class="col span-6">
        <UnitInput
          v-model:value="memory"
          placeholder="memory limits"
          label="Memory"
          base-unit="Gi"
          :required="isCustom ? true : false"
          :min="0"
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
