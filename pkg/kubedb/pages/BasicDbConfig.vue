<script setup lang="ts">
import { computed, defineEmits, defineProps, toRefs } from "vue";
import { useField } from "vee-validate";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import UnitInput from "@rancher/shell/components/form/UnitInput.vue";
import RadioGroup from "@rancher/shell/rancher-components/Form/Radio/RadioGroup.vue";

type genericOption = {
  show?: boolean;
  disabled?: boolean;
  options? : Array<{
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
}

interface Props {
  genericNamecSpaces?: genericOption;
  databaseModes: string[];
  machines: string[];
  storageClasses: string[];
  required: (value: unknown) => string;
  genericVersions?: genericOption;
  genericName?: genericOption;
}

const props = withDefaults(defineProps<Props>(), {
  genericNamecSpaces: () => ({
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
  }),
  genericName: () => ({
    show: true,
    disabled: false,
    label: "Name",
    placeholder: "Database Name",
    required: true,
    rules: [(value) => (value ? "" : "Name is required")],
    minHeight: 30,
  }),
});

const { value: namespace } = useField<string>("namespace", props.required);
const { value: name } = useField<string>("name", props.required);
const { value: version } = useField<string>("version", props.required);
const { value: replicas } = useField<string>("replicas");
const { value: machine } = useField<string>("machine");
const { value: cpu } = useField<string>("cpu");
const { value: memory } = useField<string>("memory");
const { value: storageClass } = useField<string>("storageClass", props.required);
const { value: storageSize } = useField<string>("storageSize", props.required);
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
          v-if="props.genericNamecSpaces.show"
          v-model:value="namespace"
          :clearable="props.genericNamecSpaces.clearable"
          :options="props.genericNamecSpaces.options"
          :disabled="props.genericNamecSpaces.disabled"
          :searchable="props.genericNamecSpaces.searchable"
          :multiple="props.genericNamecSpaces.multiple"
          :label="props.genericNamecSpaces.label"
          :placeholder="props.genericNamecSpaces.placeholder"
          :required = props.genericNamecSpaces.required
          :rules="props.genericNamecSpaces.rules"
        />
      </div>

      <div class="col span-6">
        <LabeledInput
          v-if="props.genericName.show"
          v-model:value="name"
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
          v-model:value="version"
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
          v-model:value="storageClass"
          :options="storageClasses"
          :searchable="true"
          :multiple="false"
          label="Storage Class"
          placeholder="Select Storage Class"
          required
        />
      </div>
      <div class="col span-6">
        <LabeledInput
          v-model:value="storageSize"
          label="Storage Size"
          :disabled="false"
          :min-height="30"
          :required="true"
        />
      </div>
    </div>
  </div>
</template>

