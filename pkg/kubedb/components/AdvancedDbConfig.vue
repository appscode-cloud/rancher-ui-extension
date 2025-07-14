<script setup lang="ts">
import { ref, defineEmits, defineProps, computed } from "vue";
import LabeledSelect from "@rancher/shell/components/form/LabeledSelect.vue";
import Accordion from "@rancher/shell/rancher-components/Accordion/Accordion.vue";
import ToggleSwitch from "@rancher/shell/rancher-components/Form/ToggleSwitch/ToggleSwitch.vue";
import TextAreaAutoGrow from "@rancher/shell/rancher-components/Form/TextArea/TextAreaAutoGrow.vue";
import KeyValue from "@rancher/shell/components/form/KeyValue.vue";
import LabeledInput from "@rancher/shell/rancher-components/Form/LabeledInput/LabeledInput.vue";
import { genericDeletionPolicyType, genericLabelsType, genericAnnotationsType,genericSecretType ,
  genericPasswordType,genericDbConfigurationType,genericPitrNamespaceType,genericPitrNameType,
  genericStreamingModeType,genericStandbyModeType
} from "../types/type";
interface Props {
  genericDeletionPolicy: genericDeletionPolicyType;
  genericLabels: genericLabelsType;
  genericAnnotations: genericAnnotationsType;
  genericDbConfiguration: genericDbConfigurationType;
  genericPassword: genericPasswordType;
  genericSecret: genericSecretType;
  genericStandbyMode: genericStandbyModeType;
  genericPitrNamespace: genericPitrNamespaceType;
  genericPitrName: genericPitrNameType;
  genericStreamingMode: genericStreamingModeType;
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
const isReferSecret = ref(false);
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
        :value="isReferSecret"
        off-label="Refer Existing Secret?"
        @update:value="isReferSecret = !isReferSecret"
      />
      <LabeledSelect
        v-if="isReferSecret && props.genericSecret.show"
        class="mb-20"
        v-model:value="props.genericSecret.secretModel"
        :options="props.genericSecret.options"
        :label="props.genericSecret.label"
        :placeholder="props.genericSecret.placeholder"
      />
      <LabeledInput
        class="mb-20"
        v-if="props.genericPassword.show"
        v-model:value="props.genericPassword.passwordModel"
        :label="props.genericPassword.label"
        :disabled="props.genericPassword.disabled"
        :min-height="props.genericPassword.minHeight"
        :placeholder="props.genericPassword.placeholder"
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
    />

    <LabeledSelect
      class="mb-20"
      v-if="props.genericStreamingMode.show"
      v-model:value="props.genericStreamingMode.streamingModeModel"
      :options="props.genericStreamingMode.options"
      :label="props.genericStreamingMode.label"
      :placeholder="props.genericStreamingMode.placeholder"
    />
  </Accordion>
</template>
