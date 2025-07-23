import { importTypes } from "@rancher/auto-import";
import { IPlugin } from "@shell/core/types";
import extensionRouting from "./routing/extension-routing";
import { useNats } from "./composables/nats";
import { getCurrentInstance } from "vue";
import type { App } from "vue";

// Init the package
export default function (plugin: IPlugin): void {
  const { natsConnect } = useNats();
  const app = getCurrentInstance()?.appContext.app as App<Element>;

  natsConnect(app);
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require("./package.json");

  // Load a product
  plugin.addProduct(require("./kubedb-config"));

  plugin.addRoutes(extensionRouting);
}
