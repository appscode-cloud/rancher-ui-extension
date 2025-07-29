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

  // //Inline action
  // plugin.addAction(
  //   ActionLocation.TABLE,
  //   {
  //     path: [
  //       {
  //         urlPath: `/${YOUR_PRODUCT_NAME}/${CUSTOM_PAGE_NAME2}`,
  //         endsWith: true,
  //       },
  //     ],
  //   },
  //   {
  //     label: "some-extension-action",
  //     icon: "icon-pipeline",
  //     enabled(ctx: any) {
  //       return true;
  //     },
  //     invoke(opts: ActionOpts, values: any[]) {
  //       console.log("table action executed 1", this, opts, values); // eslint-disable-line no-console
  //     },
  //   }
  // );

  // //bulk
  // plugin.addAction(
  //   ActionLocation.TABLE,
  //   {
  //     path: [
  //       {
  //         urlPath: `/${YOUR_PRODUCT_NAME}/${CUSTOM_PAGE_NAME2}`,
  //         endsWith: true,
  //       },
  //     ],
  //   },
  //   {
  //     label: "some-bulkable-action",
  //     multiple: true,
  //     enabled(ctx: any) {
  //       return true;
  //     },
  //     invoke(opts: ActionOpts, values: any[]) {
  //       console.log("table action executed 2", this); // eslint-disable-line no-console
  //       console.log(opts); // eslint-disable-line no-console
  //       console.log(values); // eslint-disable-line no-console
  //     },
  //   }
  // );
}
