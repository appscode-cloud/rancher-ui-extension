import $axios from "../../composables/axios";
import { useStore } from "vuex";
import { ref } from "vue";
const store = useStore();

export const useFunctions = () => {
  const isValuesLoading = ref(true);
  const isNamespaceLoading = ref(true);
  const isSecretLoading = ref(true);
  const isBundleLoading = ref(true);

  const getBundle = async () => {
    isBundleLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/rancher-imported-cluster/db-bundle`,
            verb: "GET",
            query: "type=features,common,versions&db-singular=postgres",
            body: "",
          },
        }
      );
      const data = await JSON.parse(response.data.response.body);
      console.log({ bundle: data });
      isBundleLoading.value = false;
      return { bundle: data };
    } catch (e) {
      console.log(e);
    }
    isBundleLoading.value = false;
  };

  const getNamespaces = async () => {
    isNamespaceLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/rancher-imported-cluster/proxy/identity.k8s.appscode.com/v1alpha1/selfsubjectnamespaceaccessreviews`,
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
                    resource: "postgreses",
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

  const getSecrets = async (namespace: string) => {
    isSecretLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/rancher-imported-cluster/proxy/core/v1/namespaces/${namespace}/secrets`,
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

  const getValues = async () => {
    isValuesLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/rancher-imported-cluster/helm/packageview/values`,
            verb: "GET",
            query:
              "name=kubedbcom-postgres-editor-options&sourceApiGroup=source.toolkit.fluxcd.io&sourceKind=HelmRepository&sourceNamespace=kubeops&sourceName=appscode-charts-oci&version=v0.19.0&group=kubedb.com&kind=Postgres&variant=default&namespace=default&format=json",
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

  return {
    isBundleLoading,
    isNamespaceLoading,
    isValuesLoading,
    isSecretLoading,
    getBundle,
    getNamespaces,
    getSecrets,
    getValues,
  };
};
