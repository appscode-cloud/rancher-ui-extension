import $axios from "../composables/axios";
import { Ref } from "vue";

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

  const checkDuplicate = (namespace: Ref<string>, cluster: string) => {
    return async (value: unknown) => {
      if (typeof value !== "string") return "Invalid input";

      try {
        const response = await $axios.post(
          `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
          {
            apiVersion: "rproxy.ace.appscode.com/v1alpha1",
            kind: "Proxy",
            request: {
              path: `/api/v1/clusters/rancher/${cluster}/proxy/kubedb.com/v1alpha2/namespaces/${namespace.value}/postgreses/${value}`,
              verb: "GET",
              query: `convertToTable=true`,
              body: "",
            },
          }
        );

        const data = JSON.parse(response.data.response?.body);
        console.log({ deplicate: data });

        // Add actual validation logic here
        return true;
      } catch (err) {
        // If 404 = name doesn't exist => OK
        return true;

        return "Failed to check duplicate name";
      }
    };
  };
  return { required, checkDuplicate };
}
