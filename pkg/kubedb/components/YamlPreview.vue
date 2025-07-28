<script setup lang="ts">
import yaml from "js-yaml";
import { YamlEditorInstanceType } from "types/types";
import { computed, nextTick, ref, watch } from "vue";
import YamlEditor from "@rancher/shell/components/YamlEditor.vue";
import Tabbed from "@shell/components/Tabbed/index.vue";
import Tab from "@shell/components/Tabbed/Tab.vue";

const EDITOR_MODES = {
  EDIT_CODE: "EDIT_CODE",
  VIEW_CODE: "VIEW_CODE",
  DIFF_CODE: "DIFF_CODE",
};

interface Props {
  previewFiles: Array<{ key: string; filename: string; data: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  previewFiles: () => [{ key: "", filename: "", data: "" }],
});

const emits = defineEmits(["validationChanged"]);

const yamlEditorRefs = ref<Record<string, YamlEditorInstanceType>>({});

const refreshedTabs = ref<Set<string>>(new Set());

function setYamlEditorRef(key: string, el: YamlEditorInstanceType) {
  if (el) {
    yamlEditorRefs.value[key] = el;
  }
}

const activeTab = ref(props.previewFiles[0]?.filename || "");

function onTabChanged(tabName: { selectedName: string }) {
  activeTab.value = tabName.selectedName;

  nextTick(() => {
    const tab = activeTab.value;

    if (!refreshedTabs.value.has(tab)) {
      const editor = yamlEditorRefs.value[tab];
      setTimeout(() => {
        editor?.refresh?.();
        editor?.focus?.();
        refreshedTabs.value.add(tab);
      }, 50);
    }
  });
}

const isError = computed<Record<string, boolean>>(() => {
  const result: Record<string, boolean> = {};

  for (const file of props.previewFiles) {
    try {
      yaml.load(file.data);
      result[file.filename] = false;
    } catch (e) {
      result[file.filename] = true;
    }
  }

  return result;
});

watch(isError, () => {
  const hasError = Object.values(isError.value).some(Boolean);
  emits("validationChanged", !hasError);
});
</script>

<template>
  <div class="mb-20">
    <Tabbed :use-hash="true" @changed="onTabChanged">
      <Tab
        v-for="file in previewFiles"
        :key="file.key"
        :name="file.filename"
        :label="file.filename"
        :error="isError[file.filename]"
      >
        <div class="tab-content" v-show="file.filename === activeTab">
          <YamlEditor
            :ref="(el: YamlEditorInstanceType) => setYamlEditorRef(file.filename, el)"
            v-model:value="file.data"
            mode="create"
            :asObject="false"
            :editor-mode="EDITOR_MODES.EDIT_CODE"
          />
        </div>
      </Tab>
    </Tabbed>
  </div>
</template>
