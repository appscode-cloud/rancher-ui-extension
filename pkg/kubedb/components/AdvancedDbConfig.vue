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
} from "../types/type";
interface Props {
  genericDeletionPolicy: DeletionPolicyType;
  genericLabels: LabelsType;
  genericAnnotations: AnnotationsType;
  genericDbConfiguration: DbConfigurationType;
  genericAuthPassword: AuthPasswordType;
  genericAuthSecret: AuthSecretType;
  genericStandbyMode: StandbyModeType;
  genericPitrNamespace: PitrNamespaceType;
  genericPitrName: PitrNameType;
  genericStreamingMode: StreamingModeType;
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
const isPitr = ref(false);
</script>

<template>
  <Accordion title="Advanced Configuration" class="mb-20">
    <div>
      <Accordion title="Labels & Annotations" class="mb-20">
        <h3>Labels</h3>
        <KeyValue
          class="mb-20"
          key="labels"
          v-model:value="props.genericLabels.labelsModel"
          :protected-keys="props.genericLabels.protectedKeys"
          :toggle-filter="props.genericLabels.toggleFilter"
          :add-label="props.genericLabels.addLabel"
          :add-icon="props.genericLabels.addIcon"
          :read-allowed="props.genericLabels.readAllowed"
          :value-can-be-empty="props.genericLabels.valueCanBeEmpty"
        />
        <h3>Annotations</h3>
        <KeyValue
          class="mb-20"
          key="annotations"
          v-model:value="props.genericAnnotations.annotationsModel"
          :add-label="props.genericAnnotations.addLabel"
          :add-icon="props.genericAnnotations.addIcon"
          :read-allowed="props.genericAnnotations.readAllowed"
          :value-can-be-empty="props.genericAnnotations.valueCanBeEmpty"
        />
      </Accordion>
    </div>

    <LabeledSelect
      class="mb-20"
      v-if="props.genericDeletionPolicy.show"
      v-model:value="props.genericDeletionPolicy.deletionPolicyModel"
      :options="props.genericDeletionPolicy.options"
      :label="props.genericDeletionPolicy.label"
      :placeholder="props.genericDeletionPolicy.placeholder"
      :required="props.genericDeletionPolicy.required"
      :rules="props.genericDeletionPolicy.rules"
      :clearable="props.genericDeletionPolicy.clearable"
      :searchable="props.genericDeletionPolicy.searchable"
      :multiple="props.genericDeletionPolicy.multiple"
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
        v-if="isReferAuthSecret && props.genericAuthSecret.show"
        class="mb-20"
        v-model:value="props.genericAuthSecret.AuthSecretModel"
        :options="props.genericAuthSecret.options"
        :label="props.genericAuthSecret.label"
        :placeholder="props.genericAuthSecret.placeholder"
      />
      <LabeledInput
        class="mb-20"
        v-if="props.genericAuthPassword.show"
        v-model:value="props.genericAuthPassword.AuthPasswordModel"
        :label="props.genericAuthPassword.label"
        :disabled="props.genericAuthPassword.disabled"
        :min-height="props.genericAuthPassword.minHeight"
        :placeholder="props.genericAuthPassword.placeholder"
      />
    </div>

    <div v-if="props.AdvancedToggleSwitch.DbConfig">
      <ToggleSwitch
        class="mb-20"
        v-model:value="isDbConfig"
        off-label="Configure Database?"
      />
    </div>

    <div v-if="isDbConfig && props.genericDbConfiguration.show">
      Configuration
      <TextAreaAutoGrow
        class="mb-20"
        v-model:value="props.genericDbConfiguration.dbConfigurationModel"
        :min-height="props.genericDbConfiguration.minHeight"
      />
    </div>

    <div v-if="props.AdvancedToggleSwitch.Pitr">
      <ToggleSwitch
        class="mb-20"
        :value="isPitr"
        off-label="Point in-time recovery"
        @update:value="isPitr = !isPitr"
      />
    </div>

    <div v-if="isPitr">
      <LabeledInput
        class="mb-20"
        v-if="props.genericPitrNamespace.show"
        v-model:value="props.genericPitrNamespace.pitrNamespaceModel"
        :label="props.genericPitrNamespace.label"
        :min-height="props.genericPitrNamespace.minHeight"
        :placeholder="props.genericPitrNamespace.placeholder"
        :required="isPitr ? true : false"
      />
      <LabeledInput
        class="mb-20"
        v-if="props.genericPitrName.show"
        v-model:value="props.genericPitrName.pitrNameModel"
        :label="props.genericPitrName.label"
        :min-height="props.genericPitrName.minHeight"
        :placeholder="props.genericPitrName.placeholder"
        :required="isPitr ? true : false"
      />
    </div>

    <LabeledSelect
      class="mb-20"
      v-if="props.genericStandbyMode.show"
      v-model:value="props.genericStandbyMode.standbyModeModel"
      :options="props.genericStandbyMode.options"
      :label="props.genericStandbyMode.label"
      :placeholder="props.genericStandbyMode.placeholder"
      :required="props.genericStandbyMode.required"
      :rules="props.genericStandbyMode.rules"
    />

    <LabeledSelect
      class="mb-20"
      v-if="props.genericStreamingMode.show"
      v-model:value="props.genericStreamingMode.streamingModeModel"
      :options="props.genericStreamingMode.options"
      :label="props.genericStreamingMode.label"
      :placeholder="props.genericStreamingMode.placeholder"
      :required="props.genericStreamingMode.required"
      :rules="props.genericStreamingMode.rules"
    />
  </Accordion>
</template>
