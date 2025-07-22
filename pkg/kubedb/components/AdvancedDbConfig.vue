<script setup lang="ts">
import { ref, defineEmits, defineProps, computed } from "vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Accordion from "@rancher/shell/rancher-components/Accordion/Accordion.vue";
import ToggleSwitch from "@rancher/shell/rancher-components/Form/ToggleSwitch/ToggleSwitch.vue";
import TextAreaAutoGrow from "@rancher/shell/rancher-components/Form/TextArea/TextAreaAutoGrow.vue";
import KeyValue from "@rancher/shell/components/form/KeyValue.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import {
  DeletionPolicyType,
  LabelsType,
  AnnotationsType,
  AuthSecretType,
  AuthPasswordType,
  DbConfigurationType,
  PitrNamespaceType,
  PitrNameType,
  StreamingModeType,
  StandbyModeType,
  PitrType,
} from "../types/type";

interface Props {
  DeletionPolicyProps: DeletionPolicyType;
  LabelsProps: LabelsType;
  AnnotationsProps: AnnotationsType;
  DbConfigurationProps: DbConfigurationType;
  AuthPasswordProps: AuthPasswordType;
  AuthSecretProps: AuthSecretType;
  StandbyModeProps: StandbyModeType;
  PitrNamespaceProps: PitrNamespaceType;
  PitrNameProps: PitrNameType;
  StreamingModeProps: StreamingModeType;
  PitrProps: PitrType;
  AdvancedToggleSwitch: {
    DbConfig: boolean;
    AuthCred: boolean;
    Pitr: boolean;
  };
  required: (value: unknown) => string;
}

const props = defineProps<Props>();

const isDbConfig = ref(false);
const isAuthCred = ref(false);
const isReferAuthSecret = ref(false);
</script>

<template>
  <Accordion title="Advanced Configuration" class="mb-20">
    <div>
      <Accordion title="Labels & Annotations" class="mb-20">
        <h3>Labels</h3>
        <KeyValue
          class="mb-20"
          key="labels"
          v-model:value="props.LabelsProps.labelsModel"
          :protected-keys="props.LabelsProps.protectedKeys"
          :toggle-filter="props.LabelsProps.toggleFilter"
          :add-label="props.LabelsProps.addLabel"
          :add-icon="props.LabelsProps.addIcon"
          :read-allowed="props.LabelsProps.readAllowed"
          :value-can-be-empty="props.LabelsProps.valueCanBeEmpty"
        />
        <h3>Annotations</h3>
        <KeyValue
          class="mb-20"
          key="annotations"
          v-model:value="props.AnnotationsProps.annotationsModel"
          :add-label="props.AnnotationsProps.addLabel"
          :add-icon="props.AnnotationsProps.addIcon"
          :read-allowed="props.AnnotationsProps.readAllowed"
          :value-can-be-empty="props.AnnotationsProps.valueCanBeEmpty"
        />
      </Accordion>
    </div>

    <LabeledSelect
      class="mb-20"
      v-if="props.DeletionPolicyProps.show"
      v-model:value="props.DeletionPolicyProps.deletionPolicyModel"
      :options="props.DeletionPolicyProps.options"
      :label="props.DeletionPolicyProps.label"
      :placeholder="props.DeletionPolicyProps.placeholder"
      :required="props.DeletionPolicyProps.required"
      :rules="props.DeletionPolicyProps.rules"
      :clearable="props.DeletionPolicyProps.clearable"
      :searchable="props.DeletionPolicyProps.searchable"
      :multiple="props.DeletionPolicyProps.multiple"
    />

    <div v-if="props.AdvancedToggleSwitch.AuthCred">
      <ToggleSwitch
        class="mb-20"
        :value="isAuthCred"
        off-label="Provide Authentication Credentials?"
        @update:value="isAuthCred = !isAuthCred"
      />
    </div>

    <div v-if="isAuthCred">
      <ToggleSwitch
        class="mb-20"
        :value="isReferAuthSecret"
        off-label="Refer Existing AuthSecret?"
        @update:value="isReferAuthSecret = !isReferAuthSecret"
      />
      <LabeledSelect
        v-if="isReferAuthSecret && props.AuthSecretProps.show"
        class="mb-20"
        v-model:value="props.AuthSecretProps.AuthSecretModel"
        :options="props.AuthSecretProps.options"
        :label="props.AuthSecretProps.label"
        :placeholder="props.AuthSecretProps.placeholder"
      />
      <LabeledInput
        class="mb-20"
        v-if="props.AuthPasswordProps.show"
        v-model:value="props.AuthPasswordProps.AuthPasswordModel"
        :label="props.AuthPasswordProps.label"
        :disabled="props.AuthPasswordProps.disabled"
        :min-height="props.AuthPasswordProps.minHeight"
        :placeholder="props.AuthPasswordProps.placeholder"
      />
    </div>

    <div v-if="props.AdvancedToggleSwitch.DbConfig">
      <ToggleSwitch
        class="mb-20"
        v-model:value="isDbConfig"
        off-label="Configure Database?"
      />
    </div>

    <div v-if="isDbConfig && props.DbConfigurationProps.show">
      Configuration
      <TextAreaAutoGrow
        class="mb-20"
        v-model:value="props.DbConfigurationProps.dbConfigurationModel"
        :min-height="props.DbConfigurationProps.minHeight"
      />
    </div>

    <div v-if="props.AdvancedToggleSwitch.Pitr">
      <ToggleSwitch
        class="mb-20"
        :value="props.PitrProps.pitrModel"
        off-label="Point in-time recovery"
        @update:value="props.PitrProps.pitrModel = !props.PitrProps.pitrModel"
      />
    </div>

    <div v-if="props.PitrProps.pitrModel">
      <LabeledInput
        class="mb-20"
        v-if="props.PitrNamespaceProps.show"
        v-model:value="props.PitrNamespaceProps.pitrNamespaceModel"
        :label="props.PitrNamespaceProps.label"
        :min-height="props.PitrNamespaceProps.minHeight"
        :placeholder="props.PitrNamespaceProps.placeholder"
        :required="props.PitrProps.pitrModel ? true : false"
        :rules="props.PitrProps.pitrModel ? props.PitrNamespaceProps.rules : []"
      />
      <LabeledInput
        class="mb-20"
        v-if="props.PitrNameProps.show"
        v-model:value="props.PitrNameProps.pitrNameModel"
        :label="props.PitrNameProps.label"
        :min-height="props.PitrNameProps.minHeight"
        :placeholder="props.PitrNameProps.placeholder"
        :required="props.PitrProps.pitrModel ? true : false"
        :rules="props.PitrProps.pitrModel ? props.PitrNameProps.rules : []"
      />
    </div>

    <LabeledSelect
      class="mb-20"
      v-if="props.StandbyModeProps.show"
      v-model:value="props.StandbyModeProps.standbyModeModel"
      :options="props.StandbyModeProps.options"
      :label="props.StandbyModeProps.label"
      :placeholder="props.StandbyModeProps.placeholder"
      :required="props.StandbyModeProps.required"
      :rules="props.StandbyModeProps.rules"
    />

    <LabeledSelect
      class="mb-20"
      v-if="props.StreamingModeProps.show"
      v-model:value="props.StreamingModeProps.streamingModeModel"
      :options="props.StreamingModeProps.options"
      :label="props.StreamingModeProps.label"
      :placeholder="props.StreamingModeProps.placeholder"
      :required="props.StreamingModeProps.required"
      :rules="props.StreamingModeProps.rules"
    />
  </Accordion>
</template>
