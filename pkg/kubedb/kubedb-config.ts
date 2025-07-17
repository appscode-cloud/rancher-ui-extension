// ./product.ts
import { IPlugin } from '@shell/core/types';

export function init($plugin: IPlugin, store: any) {
  const YOUR_PRODUCT_NAME = 'Kubedb';
  const CUSTOM_PAGE_NAME1 = 'postgres';
  const CUSTOM_PAGE_NAME2 = 'overview';
  const {
    product,
    configureType,
    virtualType,
    basicType
  } = $plugin.DSL(store, YOUR_PRODUCT_NAME);

  // registering a cluster-level product
  product({
    icon:    'gear',
    inStore: 'cluster', // this is what defines the extension as a cluster-level product
    weight:  100,
    to:      {
      name:   `c-cluster-${ YOUR_PRODUCT_NAME }-${ CUSTOM_PAGE_NAME1 }`,
      params: { product: YOUR_PRODUCT_NAME }
    }
  });

  // creating a custom page
  virtualType({
    labelKey: CUSTOM_PAGE_NAME1,
    name:     CUSTOM_PAGE_NAME1,
    route:    {
      name:   `c-cluster-${ YOUR_PRODUCT_NAME }-${ CUSTOM_PAGE_NAME1 }`,
      params: { product: YOUR_PRODUCT_NAME }
    }
  });
    virtualType({
    labelKey: CUSTOM_PAGE_NAME2,
    name:     CUSTOM_PAGE_NAME2,
    route:    {
      name:   `c-cluster-${ YOUR_PRODUCT_NAME }-${ CUSTOM_PAGE_NAME2 }`,
      params: { product: YOUR_PRODUCT_NAME }
    }
  });

  // registering the defined pages as side-menu entries
  basicType([CUSTOM_PAGE_NAME1, CUSTOM_PAGE_NAME2]);
}
