import $axios from "../../composables/axios";
import { ref } from "vue";
import { machines, dbObject } from "./consts";

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
  const isDbDeleting = ref(false);

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

    //machines
    modelApiValue.spec.podResources.machine = values.machine;
    modelApiValue.spec.podResources.resources.requests = {};
    modelApiValue.spec.podResources.resources.limits = {};
    const cpu =
      values.machine === "custom"
        ? values.cpu
        : machines[values.machine].resources.limits.cpu;
    const memory =
      values.machine === "custom"
        ? values.cpu
        : machines[values.machine].resources.limits.memory;

    modelApiValue.spec.podResources.resources.limits.cpu = cpu;
    modelApiValue.spec.podResources.resources.limits.memory = memory;
    modelApiValue.spec.podResources.resources.requests.cpu = cpu;
    modelApiValue.spec.podResources.resources.requests.memory = memory;

    // PITR
    // if (values.pitrName && values.pitrNamespace) {
    //   modelApiValue = setPointInTimeRecovery(cluster, values, modelApiValue);
    // }

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

  const deployCall = async (
    cluster: string,
    payload: Record<string, any>,
    responseId: string
  ) => {
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
            query: `response-id=${responseId}`,
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

  function getComponentLogStats(snapshot: any) {
    if (!snapshot || !snapshot.status || !snapshot.status.components) {
      return null;
    }

    const components: Record<string, any> = snapshot.status.components;
    const appKind = snapshot.spec?.appRef?.kind;

    if (appKind === "MongoDB") {
      for (const [key, value] of Object.entries(components)) {
        if (key.endsWith("0") && value.logStats) {
          return value.logStats;
        }
      }
    }

    if (components["wal"] && components["wal"].logStats) {
      return components["wal"].logStats;
    }

    return null;
  }

  function convertToLocal(input: any) {
    const date = new Date(input);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toString();
  }

  function convertLocalToISO8601(input: string): string | null {
    const date = new Date(input);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  const setPointInTimeRecovery = async (
    cluster: string,
    values: Record<string, any>,
    modelApiValue: Record<string, any>
  ) => {
    const refNamespace = values.pitrNamespace;
    const refDBName = values.pitrName;

    try {
      const repositoriesResp = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/proxy/storage.kubestash.com/v1alpha1/namespaces/${refNamespace}/repositories/${refDBName}-full`,
            verb: "GET",
            query: "",
            body: "",
          },
        }
      );

      const snapshotsResp = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/proxy/storage.kubestash.com/v1alpha1/namespaces/${refNamespace}/snapshots/${refDBName}-incremental-snapshot`,
            verb: "GET",
            query: "",
            body: "",
          },
        }
      );

      const repositoriesRespData = await JSON.parse(
        repositoriesResp.data.response?.body
      );
      const snapshotsRespData = await JSON.parse(
        snapshotsResp.data.response?.body
      );

      modelApiValue.spec.init.archiver.encryptionSecret.name =
        repositoriesRespData?.spec.encryptionSecret.name;
      modelApiValue.spec.init.archiver.encryptionSecret.namespace =
        repositoriesRespData?.spec.encryptionSecret.namespace;
      modelApiValue.spec.init.archiver.fullDBRepository.name = `${refDBName}-full`;
      modelApiValue.spec.init.archiver.fullDBRepository.namespace =
        refNamespace;
      modelApiValue.spec.init.archiver.manifestRepository.name = `${refDBName}-manifest`;
      modelApiValue.spec.init.archiver.manifestRepository.namespace =
        refNamespace;

      const resp = getComponentLogStats(snapshotsRespData);
      modelApiValue.spec.init.archiver.recoveryTimestamp = resp?.end;

      modelApiValue.minDate = convertToLocal(resp?.start);
      modelApiValue.maxDate = convertToLocal(resp?.end);
      return modelApiValue;
    } catch (error) {
      modelApiValue.spec.init.archiver.recoveryTimestamp = "";
      modelApiValue.spec.init.archiver.minDate = "";
      modelApiValue.spec.init.archiver.maxDate = "";
      console.error("Error loading data:", error);
    }
    return modelApiValue;
  };

  const singleDbDelete = async (
    cluster: string,
    namespace: string,
    releaseName: string,
    responseId: string
  ) => {
    isDbDeleting.value = true;
    try {
      const repositoriesResp = await $axios.post(
        `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
        {
          apiVersion: "rproxy.ace.appscode.com/v1alpha1",
          kind: "Proxy",
          request: {
            path: `/api/v1/clusters/rancher/${cluster}/proxy/helm/editor`,
            verb: "DELETE",
            query: `releaseName=${releaseName}&namespace=${namespace}&group=${dbObject.group}&version=${dbObject.version}&name=${dbObject.resource}&response-id=${responseId}`,
            body: "",
          },
        }
      );

      const data = await JSON.parse(repositoriesResp.data.response?.body);
      isDbDeleting.value = false;

      return { values: data };
    } catch (error) {
      console.error("Error loading data:", error);
    }
    isDbDeleting.value = false;
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
    isDbDeleting,
    convertLocalToISO8601,
    convertToLocal,
    singleDbDelete,
    setPointInTimeRecovery,
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
