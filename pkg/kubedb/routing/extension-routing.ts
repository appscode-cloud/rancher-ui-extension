import mongoCreate from "../pages/mongo-create.vue";
import pgCreate from "../pages/PostgresCreate/postgresCreate.vue";
// to achieve naming consistency throughout the extension
// we recommend this to be defined on a config file and exported
// so that the developer can import it wherever it needs to be used
const YOUR_PRODUCT_NAME = "Kubedb";
const CUSTOM_PAGE_NAME1 = "postgres";
const CUSTOM_PAGE_NAME2 = "mongodb";

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
    component: mongoCreate,
    meta: { product: YOUR_PRODUCT_NAME },
  },
];

export default routes;
