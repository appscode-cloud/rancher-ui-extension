import { importTypes } from "@rancher/auto-import";
import {
  IPlugin,
  OnLogOut,
  OnNavToPackage,
  OnNavAwayFromPackage,
} from "@shell/core/types";
import extensionRouting from "./routing/extension-routing";
import { remove } from "tiny-cookie";

const onEnter: OnNavToPackage = async (store, config) => {};
const onLeave: OnNavAwayFromPackage = async (store, config) => {};
const onLogout: OnLogOut = async (store) => {
  remove("_user_jwt");
  remove("_user_seed");
  remove("_nats_url");
};

// Init the package
export default function (plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require("./package.json");

  // Load a product
  plugin.addProduct(require("./kubedb-config"));

  plugin.addRoutes(extensionRouting);

  plugin.addNavHooks(onEnter, onLeave, onLogout);
}
