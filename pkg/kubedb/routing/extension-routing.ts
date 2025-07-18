import pgCreate from "../pages/PostgresCreate/postgresCreate.vue";
import Overview from "../pages/Overview.vue";
import Tabs from  "../pages/Tabs.vue";
import Loading from "../pages/Loading.vue";
// to achieve naming consistency throughout the extension
// we recommend this to be defined on a config file and exported
// so that the developer can import it wherever it needs to be used
const YOUR_PRODUCT_NAME = "Kubedb";
const CUSTOM_PAGE_NAME1 = "postgres";
const CUSTOM_PAGE_NAME2 = "overview";
const CUSTOM_PAGE_NAME3 = "tabs";
const CUSTOM_PAGE_NAME4 = "loading";

const routes = [
  // this covers the "custom page"
  {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-${CUSTOM_PAGE_NAME1}`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/${CUSTOM_PAGE_NAME1}`,
    component: pgCreate,
    meta: { product: YOUR_PRODUCT_NAME },
  },
  {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-${CUSTOM_PAGE_NAME2}`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/${CUSTOM_PAGE_NAME2}`,
    component: Overview,
    meta: { product: YOUR_PRODUCT_NAME },
  },
   {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-${CUSTOM_PAGE_NAME3}`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/${CUSTOM_PAGE_NAME3}`,
    component: Tabs,
    meta: { product: YOUR_PRODUCT_NAME },
  },
   {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-${CUSTOM_PAGE_NAME4}`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/${CUSTOM_PAGE_NAME4}`,
    component: Loading,
    meta: { product: YOUR_PRODUCT_NAME },
  },
];

export default routes;
