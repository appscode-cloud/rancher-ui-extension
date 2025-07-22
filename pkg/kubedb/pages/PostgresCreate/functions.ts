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
  const genericResourceLoading = ref(false);
  const resourceSummaryLoading = ref(false);
  const getArchiverNameLoading = ref(false);

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
          options.push({ label: item, value: item });
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
      return { values: options };
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
    modelApiValue.spec.replicas = values.replicas;
    modelApiValue.spec.remoteReplica = values.remoteReplica;
    modelApiValue.spec.podResources.machine = values.machine;
    modelApiValue.spec.podResources.resources.requests = {};
    modelApiValue.spec.podResources.resources.requests.cpu = values.cpu;
    modelApiValue.spec.podResources.resources.requests.memory = values.memory;
    modelApiValue.spec.podResources.resources.limits = {};
    modelApiValue.spec.podResources.resources.limits.cpu = values.cpu;
    modelApiValue.spec.podResources.resources.limits.memory = values.memory;
    modelApiValue.spec.admin.storageClasses.default = values.storageClass;
    modelApiValue.spec.annotations = values.annotations;
    modelApiValue.spec.labels = values.labels;
    modelApiValue.spec.deletionPolicy = values.deletionPolicy;
    modelApiValue.spec.persistence.size = values.storageSize;
    modelApiValue.spec.configuration = values.dbConfiguration;
    modelApiValue.spec.mode = values.mode;
    modelApiValue.spec.standbyMode = values.standbyMode;
    modelApiValue.spec.streamingMode = values.streamingMode;
    modelApiValue.form.alert.enabled = values.monitoring
      ? values.alert ?? "warning"
      : "none";
    modelApiValue.spec.admin.monitoring.agent = values.monitoring
      ? "prometheus.io/operator"
      : "";

    modelApiValue.spec.backup.tool = values.backup ? "KubeStash" : "";
    modelApiValue.spec.admin.tls.default = values.tls;
    modelApiValue.spec.admin.clusterIssuers.default = values.clusterIssuer;
    modelApiValue.spec.admin.expose.default = values.expose;

    modelApiValue.spec.authSecret = {};
    modelApiValue.spec.authSecret.name = values.AuthSecret;
    modelApiValue.spec.authSecret.password = values.AuthPassword;

    //Archiver
    modelApiValue.spec.admin.archiver.enable.default = values.archiver;
    const stClass = modelApiValue.spec.admin.storageClasses.default;
    const found = archiverMap.find((item) => item.storageClass === stClass);
    const via = modelApiValue.spec.admin.archiver.via;
    if (modelApiValue.spec.admin.archiver.enable.default) {
      if (via === "VolumeSnapshotter")
        modelApiValue.spec.archiverName = found?.annotation;
      else {
        modelApiValue.spec.archiverName = found?.annotation;
        modelApiValue.spec.archiverName =
          modelApiValue.metadata.resource.kind.toLocaleLowerCase();
      }
    } else {
      modelApiValue.spec.archiverName = "";
    }

    // PITR
    modelApiValue.spec.init.archiver.recoveryTimestamp = "";

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

  const genericResourceCall = async (cluster: string) => {
    genericResourceLoading.value = true;
    const date = Date.now();
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/proxy/core.k8s.appscode.com/v1alpha1/genericresources`,
            verb: "GET",
            query: `convertToTable=true&labelSelector=k8s.io/group=kubedb.com&ctag=${date}`,
            body: "",
          },
        }
      );

      const data = await JSON.parse(response.data.response?.body);
      genericResourceLoading.value = false;
      return { values: data };
    } catch (error) {
      console.error("Error loading data:", error);
    }
    genericResourceLoading.value = false;
  };

  const resourceSummaryCall = async (cluster: string) => {
    resourceSummaryLoading.value = true;
    const date = Date.now();
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/proxy/core.k8s.appscode.com/v1alpha1/resourcesummaries`,
            verb: "GET",
            query: `convertToTable=true&labelSelector=k8s.io/group=kubedb.com&ctag=${date}`,
            body: "",
          },
        }
      );

      const data = await JSON.parse(response.data.response?.body);
      resourceSummaryLoading.value = false;
      return { values: data };
    } catch (error) {
      console.error("Error loading data:", error);
    }
    resourceSummaryLoading.value = false;
  };

  let archiverMap: Array<{ storageClass: string; annotation: string }> = [];
  const getArchiverName = async (
    cluster: string,
    modelApiValue: Record<string, any>
  ) => {
    getArchiverNameLoading.value = true;
    try {
      const response = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/proxy/storage.k8s.io/v1/storageclasses`,
            verb: "GET",
            query: "",
            body: "",
          },
        }
      );
      const resource = modelApiValue.metadata.release.name;
      const group = modelApiValue.metadata.release.group;
      const data = await JSON.parse(response.data.response?.body);
      data?.items?.forEach(
        (item: {
          metadata: { annotations: Record<string, string>; name: string };
        }) => {
          const annotations = item.metadata?.annotations;
          const classname = item.metadata?.name;
          const annotationKeyToFind = `${resource}.${group}/archiver`;
          archiverMap.push({
            storageClass: classname,
            annotation: annotations[annotationKeyToFind],
          });
        }
      );
      getArchiverNameLoading.value = false;
      return { values: data };
    } catch (error) {
      console.error("Error loading data:", error);
    }
    getArchiverNameLoading.value = false;
  };

  return {
    isBundleLoading,
    isNamespaceLoading,
    isValuesLoading,
    isAuthSecretLoading,
    isModelLoading,
    isResourceSkipLoading,
    isDeploying,
    genericResourceLoading,
    resourceSummaryLoading,
    getArchiverNameLoading,
    getArchiverName,
    resourceSummaryCall,
    genericResourceCall,
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
