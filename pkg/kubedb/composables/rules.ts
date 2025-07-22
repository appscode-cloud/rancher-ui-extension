import $axios from "../composables/axios";

export function useRules() {
  const required = (value: unknown) => {
    if (!!value || value === 0) {
      if (Array.isArray(value) && value.length > 0) return "";
      else if (typeof value === "object" && Object.keys(value).length > 0)
        return "";
      if (typeof value === "string" && value.length > 0) return "";
      if (typeof value === "boolean" || typeof value === "number") return "";
    }
    return "This field is required";
  };

  const checkDuplicate = async (value: unknown) => {
    const response = await $axios.post(
      `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
      {
        apiVersion: "rproxy.ace.appscode.com/v1alpha1",
        kind: "Proxy",
        request: {
          path: `/api/v1/clusters/appscode/ui-local-all-installed/proxy/kubedb.com/v1alpha2/namespaces/demo/postgreses/${value}`,
          verb: "GET",
          query: `convertToTable=true`,
          body: "",
        },
      }
    );

    const data = await JSON.parse(response.data.response?.body);
    return { values: data };
  };
  return { required, checkDuplicate };
}
