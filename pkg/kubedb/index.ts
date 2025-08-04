import { importTypes } from "@rancher/auto-import";
import { ActionLocation, ActionOpts, IPlugin } from "@shell/core/types";
import extensionRouting from "./routing/extension-routing";
import { useNats } from "./composables/nats";
import { getCurrentInstance } from "vue";
import type { App } from "vue";

// const YOUR_PRODUCT_NAME = "kubedb";
// const CUSTOM_PAGE_NAME2 = "overview";

// Init the package
export default function (plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require("./package.json");

  // Load a product
  plugin.addProduct(require("./kubedb-config"));

  plugin.addRoutes(extensionRouting);
}
