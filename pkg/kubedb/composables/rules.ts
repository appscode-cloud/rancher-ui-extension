import { getCurrentInstance, Ref, ref } from "vue";
import { useStore } from "vuex";
import { useFunctions } from "../pages/PostgresCreate/functions";

const namespaceKindMap: Record<string, Record<string, string[]>> = {};
const clusterName = ref<string>("");
export function useRules() {
  const { genericResourceCall } = useFunctions();

  const getClusters = async () => {
    const store = useStore();
    const route = getCurrentInstance()?.proxy?.$route;
    const params = route?.params;

    try {
      const result = await store.dispatch("management/findAll", {
        type: "management.cattle.io.cluster",
      });
      result.forEach((ele: { id: string; spec: { displayName: string } }) => {
        if (ele.id === params?.cluster) {
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

  const getAllAvailableDbNames = async () => {
    await getClusters();
    const genericResourceResponse = await genericResourceCall(
      clusterName.value
    );

    genericResourceResponse?.values.rows.forEach(
      (ele: { cells: Array<Record<string, string>> }) => {
        const dbName = ele.cells[0]?.data;
        const ns = ele.cells[1]?.data;
        const kind = ele.cells[2]?.data;

        if (!ns || !kind || !dbName) return;

        if (!namespaceKindMap[ns]) {
          namespaceKindMap[ns] = {};
        }

        if (!namespaceKindMap[ns][kind]) {
          namespaceKindMap[ns][kind] = [];
        }

        namespaceKindMap[ns][kind].push(dbName);
      }
    );
  };

  const checkDuplicate = (namespace: Ref<string>, dbKind: string) => {
    return (value: unknown) => {
      if (!value) return "This field is required";

      const name = String(value);
      const ns = namespace.value;

      const existingNames = namespaceKindMap[ns]?.[dbKind] ?? [];
      if (existingNames.includes(name)) {
        return `Database with name "${name}" already exists in namespace "${ns}""`;
      }
      return "";
    };
  };
  return { required, checkDuplicate, getAllAvailableDbNames };
}
