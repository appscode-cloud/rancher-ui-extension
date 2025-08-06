import { IPlugin } from "@shell/core/types";
import {
  YOUR_PRODUCT_NAME,
  overviewPage,
  postgresPage,
} from "./extension-info";

export function init($plugin: IPlugin, store: any) {
  const { product, virtualType, basicType } = $plugin.DSL(
    store,
    YOUR_PRODUCT_NAME
  );

  // registering a cluster-level product
  product({
    icon: "gear",
    inStore: "cluster", // this is what defines the extension as a cluster-level product
    weight: 100,
    to: {
      name: `c-cluster-${YOUR_PRODUCT_NAME}-${postgresPage}`,
      params: { product: YOUR_PRODUCT_NAME },
    },
  });

  // creating a custom page
  virtualType({
    labelKey: postgresPage,
    name: postgresPage,
    route: {
      name: `c-cluster-${YOUR_PRODUCT_NAME}-${postgresPage}`,
      params: { product: YOUR_PRODUCT_NAME },
    },
  });
  virtualType({
    labelKey: overviewPage,
    name: overviewPage,
    route: {
      name: `c-cluster-${YOUR_PRODUCT_NAME}-${overviewPage}`,
      params: { product: YOUR_PRODUCT_NAME },
    },
  });

  // registering the defined pages as side-menu entries
  basicType([postgresPage, overviewPage]);
}
