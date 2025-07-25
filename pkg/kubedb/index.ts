import { importTypes } from "@rancher/auto-import";
import { IPlugin, ActionLocation, ActionOpts } from "@shell/core/types";
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

  // plugin.addAction(
  //   ActionLocation.TABLE,
  //   { path: [{ urlPath: "/overview", endsWith: true }] },
  //   {
  //     label: "Delete",
  //     enabled: true,
  //     invoke(opts: ActionOpts, values: any[]) {
  //       console.log("table action executed 1", this, opts, values); // eslint-disable-line no-console
  //     },
  //   }
  // );

  // // TABLE ACTIONS - ROW + BULKABLE
  // plugin.addAction(
  //   ActionLocation.TABLE,
  //   { path: [{ urlPath: "/overview", endsWith: true }] },
  //   {
  //     label: "Delete",
  //     multiple: true,
  //     enabled: true,
  //     invoke(opts: ActionOpts, values: any[]) {
  //       console.log("table action executed 2", this); // eslint-disable-line no-console
  //       console.log(opts); // eslint-disable-line no-console
  //       console.log(values); // eslint-disable-line no-console
  //     },
  //   }
  // );

  plugin.addRoutes(extensionRouting);
}
