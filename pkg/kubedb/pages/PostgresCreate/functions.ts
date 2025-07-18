import $axios from "../../composables/axios";
import { ref } from "vue";

export const dbObject = {
  kind: "Postgres",
  resource: "postgreses",
  chartName: "kubedbcom-postgres-editor-options",
};

export const useFunctions = () => {
  const isValuesLoading = ref(false);
  const isNamespaceLoading = ref(false);
  const isAuthSecretLoading = ref(false);
  const isBundleLoading = ref(false);
  const isModelLoading = ref(false);
  const isResourceSkipLoading = ref(false);
  const isDeploying = ref(false);

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

  const getAuthSecrets = async (namespace: string, cluster: string) => {
    isAuthSecretLoading.value = true;
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
      isAuthSecretLoading.value = false;
      return options;
    } catch (e) {
      console.log(e);
    }
    isAuthSecretLoading.value = false;
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

  const generateModelPayload = (
    values: any,
    modelApiValue: Record<string, any>
  ) => {
    modelApiValue.metadata.release.name = values.name;
    modelApiValue.metadata.release.namespace = values.namespace;
    modelApiValue.spec.admin.databases[dbObject.kind].default = values.version;
    // modelApiValue.spec.admin.archiver.enable.default = values.archiver;
    modelApiValue.spec.admin.storageClasses.default = values.storageClass;
    // modelApiValue.spec.admin.tls.default = values.tls;
    // modelApiValue.spec.admin.expose.default = values.expose;
    // modelApiValue.form.alert.enabled = values.alert;
    modelApiValue.spec.deletionPolicy = values.deletionPolicy;
    modelApiValue.spec.annotations = values.annotations;
    modelApiValue.spec.labels = values.labels;
    modelApiValue.spec.AuthSecret.name = values.secret;
    modelApiValue.spec.AuthSecret.password = values.password;
    modelApiValue.spec.configuration = values.dbConfiguration;
    modelApiValue.spec.mode = values.mode;
    modelApiValue.spec.persistence.size = values.storageSize;
    modelApiValue.spec.podResources.machine = values.machine;
    modelApiValue.spec.podResources.resources.requests.cpu = values.cpu;
    modelApiValue.spec.podResources.resources.requests.memory = values.memory;
    modelApiValue.spec.podResources.resources.limits = {};
    modelApiValue.spec.podResources.resources.limits.cpu = values.cpu;
    modelApiValue.spec.podResources.resources.limits.memory = values.memory;
    modelApiValue.spec.replicas = values.replicas;
    modelApiValue.spec.standbyMode = values.standbyMode;
    modelApiValue.spec.streamingMode = values.streamingMode;
    modelApiValue.spec.admin.clusterIssuers = values.clusterIssuer;
    // modelApiValue.spec.archiverName = values.archiver
    //   ? dbObject.kind.toLocaleLowerCase()
    //   : "";

    // modelApiValue.spec.backup.tool = values.backup ? "KubeStash" : "";
    // modelApiValue.spec.monitoring.agent = values.monitoring
    //   ? "prometheus.io/operator"
    //   : "";

    return modelApiValue;
  };

  const modelApiCall = async (
    cluster: string,
    modelApiValue: Record<string, any>
  ) => {
    isModelLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/helm/options/model`,
            verb: "PUT",
            query: "",
            body: JSON.stringify(modelApiValue),
          },
        }
      );

      const data = await JSON.parse(response.data.response?.body);
      isModelLoading.value = false;
      return { values: data };
    } catch (error) {
      console.error("Error loading data:", error);
    }
    isModelLoading.value = false;
  };

  const resourceSkipCRDApiCall = async (
    cluster: string,
    payload: Record<string, any>
  ) => {
    isResourceSkipLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/helm/options/resources`,
            verb: "PUT",
            query: "skipCRDs=true",
            body: JSON.stringify(payload),
          },
        }
      );

      const data = await JSON.parse(response.data.response?.body);
      isResourceSkipLoading.value = false;
      return { values: data };
    } catch (error) {
      console.error("Error loading data:", error);
    }
    isResourceSkipLoading.value = false;
  };

  const deployCall = async (cluster: string, payload: Record<string, any>) => {
    isDeploying.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/helm/editor`,
            verb: "PUT",
            query: "",
            body: JSON.stringify(payload),
          },
        }
      );

      const data = await JSON.parse(response.data.response?.body);
      isDeploying.value = false;
      return { values: data };
    } catch (error) {
      console.error("Error loading data:", error);
    }
    isDeploying.value = false;
  };

  return {
    isBundleLoading,
    isNamespaceLoading,
    isValuesLoading,
    isAuthSecretLoading,
    isModelLoading,
    isResourceSkipLoading,
    isDeploying,
    deployCall,
    resourceSkipCRDApiCall,
    generateModelPayload,
    modelApiCall,
    getBundle,
    getNamespaces,
    getAuthSecrets,
    getValues,
  };
};
