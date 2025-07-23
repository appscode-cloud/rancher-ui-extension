import $axios from "../composables/axios";
import { Ref, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { dbObject } from "../pages/PostgresCreate/consts";

export function useRules() {
  const clusterName = ref<string>("");

  const getClusters = async () => {
    const store = useStore();
    const { params } = useRoute();

    try {
      const result = await store.dispatch("management/findAll", {
        type: "management.cattle.io.cluster",
      });
      result.forEach((ele: { id: string; spec: { displayName: string } }) => {
        if (ele.id === params.cluster) {
          clusterName.value = ele.spec.displayName;
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

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

  const checkDuplicate = (namespace: Ref<string>) => {
    getClusters();
    return async (value: unknown) => {
      if (!value) return "This field is required";

      try {
        await $axios.post(
          `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
          {
            apiVersion: "rproxy.ace.appscode.com/v1alpha1",
            kind: "Proxy",
            request: {
              path: `/api/v1/clusters/rancher/${clusterName.value}/proxy/kubedb.com/v1alpha2/namespaces/${namespace.value}/${dbObject.resource}/${value}`,
              verb: "GET",
              query: `convertToTable=true`,
              body: "",
            },
          }
        );
        return "This name is already taken";
      } catch (err) {
        return true;
      }
    };
  };
  return { required, checkDuplicate };
}
