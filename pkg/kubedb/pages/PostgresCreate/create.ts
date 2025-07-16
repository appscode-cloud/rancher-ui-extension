import { useField, useForm } from "vee-validate";
import { useRequiredRule } from "../../composables/useRequiredRule";
const { required } = useRequiredRule();

export const useCreateForm = () => {
  const { values, errors, validate } = useForm({});
  const { value: name } = useField<string>("name", required);
  const { value: namespace } = useField<string>("namespace", required);
  const { value: version } = useField<string>("version", required);
  const { value: replicas } = useField<string>("replicas");
  const { value: machine } = useField<string>("machine", required, {
    initialValue: "custom",
  });
  const { value: cpu } = useField<string>("cpu", "", { initialValue: "500m" });
  const { value: memory } = useField<string>("memory", "", {
    initialValue: "1",
  });
  const { value: storageClass } = useField<string>("storageClass", required);
  const { value: storageSize } = useField<string>("storageSize", required, {
    initialValue: "2Gi",
  });
  const { value: deletionPolicy } = useField<string>(
    "deletionPolicy",
    required,
    {
      initialValue: "WipeOut",
    }
  );
  const { value: dbConfiguration } = useField<string>("dbConfiguration");
  const { value: password } = useField<string>("password");
  const { value: secret } = useField<string>("secret");
  const { value: pitrNamespace } = useField<string>("pitrNamespace");
  const { value: pitrName } = useField<string>("pitrName");
  const { value: alert } = useField<string>("alert");
  const { value: standbyMode } = useField<string>("standbyMode", required, {
    initialValue: "Hot",
  });
  const { value: streamingMode } = useField<string>("streamingMode", required, {
    initialValue: "Asynchronous",
  });
  const { value: clusterIssuer } = useField<string>("clusterIssuer");
  const { value: labels } = useField<Record<string, string>>("labels");
  const { value: annotations } =
    useField<Record<string, string>>("annotations");
  const { value: mode } = useField<string>("mode", "", {
    initialValue: "standalone",
  });

  return {
    values,
    errors,
    name,
    namespace,
    version,
    machine,
    replicas,
    cpu,
    memory,
    storageClass,
    storageSize,
    deletionPolicy,
    dbConfiguration,
    password,
    secret,
    pitrNamespace,
    pitrName,
    alert,
    standbyMode,
    streamingMode,
    clusterIssuer,
    labels,
    annotations,
    mode,
    validate,
  };
};
