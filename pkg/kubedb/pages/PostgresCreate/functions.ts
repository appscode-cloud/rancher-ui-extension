import $axios from "../../composables/axios";
import { useStore } from "vuex";
import { ref } from "vue";
const store = useStore();

export const dbObject = {
  kind: "Postgres",
  resource: "postgreses",
  chartName: "kubedbcom-postgres-editor-options",
};

export const useFunctions = () => {
  const isValuesLoading = ref(true);
  const isNamespaceLoading = ref(true);
  const isSecretLoading = ref(true);
  const isBundleLoading = ref(true);

  const getBundle = async (cluster: string) => {
    isBundleLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/db-bundle`,
            verb: "GET",
            query: `type=features,common,versions&db-singular=${dbObject.kind.toLocaleLowerCase()}`,
            body: "",
          },
        }
      );
      const data = await JSON.parse(response.data.response.body);
      isBundleLoading.value = false;
      return { bundle: data };
    } catch (e) {
      console.log(e);
    }
    isBundleLoading.value = false;
  };

  const getNamespaces = async (cluster: string) => {
    isNamespaceLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/proxy/identity.k8s.appscode.com/v1alpha1/selfsubjectnamespaceaccessreviews`,
            verb: "POST",
            query: "",
            body: JSON.stringify({
              apiVersion: "identity.k8s.appscode.com/v1alpha1",
              kind: "SelfSubjectNamespaceAccessReview",
              spec: {
                resourceAttributes: [
                  {
                    verb: "create",
                    group: "kubedb.com",
                    version: "v1",
                    resource: dbObject.resource,
                  },
                ],
              },
            }),
          },
        }
      );
      const data = await JSON.parse(response.data.response.body);
      const projects = data?.status?.projects;
      const options: Array<{ label: string; value: string }> = [];
      Object.keys(projects).forEach((key) => {
        projects[key].forEach((item: string) => {
          options?.push({ label: item, value: item });
        });
      });
      isNamespaceLoading.value = false;
      return options;
    } catch (e) {
      console.log(e);
    }
    isNamespaceLoading.value = false;
  };

  const getSecrets = async (namespace: string, cluster: string) => {
    isSecretLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/proxy/core/v1/namespaces/${namespace}/secrets`,
            verb: "GET",
            query: "",
            body: "",
          },
        }
      );
      const data = await JSON.parse(response.data.response.body);
      let options = [];
      options = data?.items?.map((ele: { metadata: { name: string } }) => {
        return ele?.metadata.name;
      });
      isSecretLoading.value = false;
      return options;
    } catch (e) {
      console.log(e);
    }
    isSecretLoading.value = false;
  };

  const getValues = async (cluster: string, namespace: string) => {
    isValuesLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/helm/packageview/values`,
            verb: "GET",
            query: `name=${dbObject.chartName}&sourceApiGroup=source.toolkit.fluxcd.io&sourceKind=HelmRepository&sourceNamespace=kubeops&sourceName=appscode-charts-oci&version=v0.19.0&group=kubedb.com&kind=${dbObject.kind}&variant=default&namespace=${namespace}&format=json`,
            body: "",
          },
        }
      );

      const data = await JSON.parse(response.data.response?.body);
      isValuesLoading.value = false;
      return { values: data };
    } catch (error) {
      console.error("Error loading data:", error);
    }
    isValuesLoading.value = false;
  };

  const getClusters = async () => {
    try {
      const result = await store.dispatch("management/findAll", {
        type: "management.cattle.io.cluster",
      });
      const clusterIdList = result.map((ele: { id: string }) => {
        return ele.id;
      });
      return clusterIdList;
    } catch (e) {
      console.log(e);
    }
  };

  const generateModelPayload = (
    values: any,
    modelApiValue: Record<string, any>
  ) => {
    modelApiValue.metadata.release.name = values.name;
    modelApiValue.metadata.release.namespace = values.namespace;
    console.log(values);
    console.log(modelApiValue);
    return modelApiValue;
  };

  return {
    isBundleLoading,
    isNamespaceLoading,
    isValuesLoading,
    isSecretLoading,
    generateModelPayload,
    getBundle,
    getNamespaces,
    getSecrets,
    getValues,
  };
};
