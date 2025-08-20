import pgCreate from "../pages/PostgresCreate/postgresCreate.vue";
import Overview from "../pages/Overview.vue";
import Details from "../pages/Details.vue";
import {
  YOUR_PRODUCT_NAME,
  overviewPage,
  postgresPage,
} from "../extension-info";
// to achieve naming consistency throughout the extension
// we recommend this to be defined on a config file and exported
// so that the developer can import it wherever it needs to be used

const routes = [
  // this covers the "custom page"
  {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-${postgresPage.toLowerCase()}`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/${postgresPage.toLowerCase()}`,
    component: pgCreate,
    meta: { product: YOUR_PRODUCT_NAME },
  },
  {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-${overviewPage.toLowerCase()}`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/${overviewPage.toLowerCase()}`,
    component: Overview,
    meta: { product: YOUR_PRODUCT_NAME },
  },
  {
    name: `c-cluster-${YOUR_PRODUCT_NAME}-db-details`,
    path: `/c/:cluster/${YOUR_PRODUCT_NAME}/:group/:version/:kind/:namespace/:dbName/details`,
    component: Details,
    meta: { product: YOUR_PRODUCT_NAME },
  },
];

export default routes;
