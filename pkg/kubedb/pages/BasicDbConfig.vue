<script setup lang="ts">
import { computed, defineEmits, defineProps, toRefs } from "vue";
import { useField } from "vee-validate";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import UnitInput from "@rancher/shell/components/form/UnitInput.vue";
import RadioGroup from "@rancher/shell/rancher-components/Form/Radio/RadioGroup.vue";

type NamespaceOption = {
    label : string 
    value : string
}
interface Props {
  namePlaceholder?: string;
  namespaces: NamespaceOption[];
  versions: NamespaceOption[];
  databaseModes: string[];
  machines: string[];
  storageClasses: string[];
  required: (value: unknown) => string;
}

const props = withDefaults(defineProps<Props>(), {
  namePlaceholder: "Database Name",
});

const emit = defineEmits<{
  'update:mode': [value: string];
}>();

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
          v-model:value="namespace"
          :clearable="true"
          :options="namespaces"
          :disabled="false"
          :searchable="true"
          :multiple="false"
          label="Namespace"
          placeholder="Select Namespace"
          required
          :rules="[required]"
        />
      </div>

      <div class="col span-6">
        <LabeledInput
          v-model:value="name"
          label="Name"
          :placeholder="namePlaceholder"
          :disabled="false"
          :min-height="30"
          :required="true"
          :rules="[required]"
        />
      </div>
    </div>

    <div class="row mb-20">
      <div class="col span-6">
        <LabeledSelect
          v-model:value="version"
          :clearable="true"
          :options="versions"
          :disabled="false"
          :searchable="true"
          :multiple="false"
          label="Version"
          placeholder="Select version"
          required
          :rules="[required]"
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

