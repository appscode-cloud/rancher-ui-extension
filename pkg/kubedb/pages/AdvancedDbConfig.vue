<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";
import { useField } from "vee-validate";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Accordion from "@rancher/shell/rancher-components/Accordion/Accordion.vue";
import ToggleSwitch from "@rancher/shell/rancher-components/Form/ToggleSwitch/ToggleSwitch.vue";
import TextAreaAutoGrow from "@rancher/shell/rancher-components/Form/TextArea/TextAreaAutoGrow.vue";
import KeyValue from "@rancher/shell/components/form/KeyValue.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";

type NamespaceOption = {
  label: string;
  value: string;
};

interface Props {
  namespaces: NamespaceOption[];
  required: (value: unknown) => string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:labels': [value: Record<string, string>];
  'update:annotations': [value: Record<string, string>];
  'update:dbConfiguration': [value: string];
}>();

const isDbConfig = ref(false);
const isAuthCred = ref(false);
const isReferSecret = ref(false);
const isPitr = ref(false);
const deletionPolicies = ref(["Delete", "Halt", "WipeOut", "DoNotTerminate"]);
const secretsList = ref(["test1", "test2", "test3", "test4"]);
const standbyModes = ref(["Hot", "Warm"]);
const streamingModes = ref(["Synchronous", "Asynchronous"]);

const { value: deletionPolicy } = useField<string>("deletionPolicy", props.required);
const { value: labels } = useField<Record<string, string>>("labels");
const { value: annotations } = useField<Record<string, string>>("annotations");
const { value: dbConfiguration } = useField<string>("dbConfiguration");
const { value: password } = useField<string>("password");
const { value: secret } = useField<string>("secret");
const { value: standbyMode } = useField<string>("standbyMode");
const { value: pitrNamespace } = useField<string>("pitrNamespace");
const { value: pitrName } = useField<string>("pitrName");
const { value: streamingMode } = useField<string>("streamingMode");

const updateLabels = (e: Record<string, string>) => {
  labels.value = e;
  emit('update:labels', e);
};

const updateAnnotations = (e: Record<string, string>) => {
  annotations.value = e;
  emit('update:annotations', e);
};

const updateDbConfiguration = (e: string) => {
  dbConfiguration.value = e;
  emit('update:dbConfiguration', e);
};
</script>

<template>
  <Accordion title="Advanced Configuration" class="mb-20">
    <div>
      <Accordion title="Labels & Annotations" class="mb-20">
        <h3>Labels</h3>
        <KeyValue
          class="mb-20"
          key="labels"
          :value="labels"
          :protected-keys="[]"
          :toggle-filter="true"
          add-label="Add Labels"
          :add-icon="''"
          :read-allowed="false"
          :value-can-be-empty="true"
          @update:value="updateLabels"
        />
        <h3>Annotations</h3>
        <KeyValue
          class="mb-20"
          key="Annotations"
          :value="annotations"
          add-label="Add Annotations"
          :add-icon="''"
          :read-allowed="false"
          :value-can-be-empty="true"
          @update:value="updateAnnotations"
        />
      </Accordion>
    </div>

    <LabeledSelect
      class="mb-20"
      v-model:value="deletionPolicy"
      :options="deletionPolicies"
      label="Deletion Policy"
      required
    />
    
    <ToggleSwitch
      class="mb-20"
      :value="isAuthCred"
      off-label="Provide Authentication Credentials?"
      @update:value="isAuthCred = !isAuthCred"
    />
    
    <div v-if="isAuthCred">
      <ToggleSwitch
        class="mb-20"
        :value="isReferSecret"
        off-label="Refer Existing Secret?"
        @update:value="isReferSecret = !isReferSecret"
      />
      <LabeledSelect
        v-if="isReferSecret"
        class="mb-20"
        v-model:value="secret"
        :options="secretsList"
        label="Secret"
      />
      <LabeledInput
        class="mb-20"
        v-model:value="password"
        label="Password (Leave it blank to auto generate password)"
        :disabled="false"
        :min-height="30"
      />
    </div>

    <ToggleSwitch
      class="mb-20"
      :value="isDbConfig"
      off-label="Configure Database?"
      @update:value="isDbConfig = !isDbConfig"
    />
    
    <div v-if="isDbConfig">
      Configuration
      <TextAreaAutoGrow
        class="mb-20"
        :value="dbConfiguration"
        :min-height="120"
        @update:value="updateDbConfiguration"
      />
    </div>

    <ToggleSwitch
      class="mb-20"
      :value="isPitr"
      off-label="Point in-time recovery"
      @update:value="isPitr = !isPitr"
    />

    <div v-if="isPitr">
      <LabeledInput
        class="mb-20"
        v-model:value="pitrNamespace"
        label="Namespace"
        :min-height="30"
        :required="isPitr ? true : false"
      />
      <LabeledInput
        class="mb-20"
        v-model:value="pitrName"
        label="Name"
        :min-height="30"
        :required="isPitr ? true : false"
      />
    </div>

    <LabeledSelect
      class="mb-20"
      v-model:value="standbyMode"
      :options="standbyModes"
      label="Standby Mode"
    />
    
    <LabeledSelect
      class="mb-20"
      v-model:value="streamingMode"
      :options="streamingModes"
      label="Streaming Mode"
    />
  </Accordion>
</template>