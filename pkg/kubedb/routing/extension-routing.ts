import pgCreate from "../pages/PostgresCreate/postgresCreate.vue";
import Overview from "../pages/Overview.vue";
import Details from "../pages/Details.vue";
// to achieve naming consistency throughout the extension
// we recommend this to be defined on a config file and exported
// so that the developer can import it wherever it needs to be used
const YOUR_PRODUCT_NAME = "kubedb";
const postgresPage = "postgres";
const overviewPage = "overview";

const routes = [
  // this covers the "custom page"
  {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-${postgresPage}`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/${postgresPage}`,
    component: pgCreate,
    meta: { product: YOUR_PRODUCT_NAME },
  },
  {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-${overviewPage}`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/${overviewPage}`,
    component: Overview,
    meta: { product: YOUR_PRODUCT_NAME },
  },
  {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-kind-namespace-db-details`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/:kind/:namespace/:dbName/details`,
    component: Details,
    meta: { product: YOUR_PRODUCT_NAME },
  },
];

export default routes;
