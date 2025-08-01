import { computed } from "vue";
import { useField, useForm } from "vee-validate";
import { useRules } from "../../composables/rules";
import { dbObject } from "../PostgresCreate/consts";

export const useCreateForm = () => {
  const { required, checkDuplicate } = useRules();
  const { values, errors, validate } = useForm({});

  // conditional rules
  const replicaRules = computed(() => {
    return values.mode === "Cluster" ? required : undefined;
  });
  const remoteReplicaRules = computed(() => {
    return values.mode === "RemoteReplica" ? required : undefined;
  });
  const machineRules = computed(() => {
    return values.machine !== "custom" ? required : undefined;
  });
  const alertRules = computed(() => {
    return values.monitoring ? required : undefined;
  });
  const clusterIssuerRule = computed(() => {
    return values.tls ? required : undefined;
  });
  const pitrRule = computed(() => {
    return values.pitr ? required : undefined;
  });
  // end of conditional rules

  // Form Fields
  const { value: namespace } = useField<string>("namespace", required);
  const { value: name } = useField<string>(
    "name",
    checkDuplicate(namespace, dbObject.kind)
  );

  const { value: version } = useField<string>("version", required);
  const { value: replicas } = useField<string>("replicas", replicaRules);
  const { value: remoteReplica } = useField<string>(
    "remoteReplica",
    remoteReplicaRules
  );

  const { value: machine } = useField<string>("machine", required, {
    initialValue: "custom",
  });
  const { value: cpu } = useField<string>("cpu", machineRules, {
    initialValue: "500m",
  });
  const { value: memory } = useField<string>("memory", machineRules, {
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

  const { value: labels } = useField<Record<string, string>>("labels");
  const { value: annotations } =
    useField<Record<string, string>>("annotations");
  const { value: dbConfiguration } = useField<string>("dbConfiguration");
  const { value: AuthPassword } = useField<string>("AuthPassword");
  const { value: AuthSecret } = useField<string>("AuthSecret");
  const { value: pitr } = useField<boolean>("pitr");
  const { value: pitrNamespace } = useField<string>("pitrNamespace", pitrRule);
  const { value: pitrName } = useField<string>("pitrName", pitrRule);
  const { value: pitrDate } = useField<Date | null>("pitrDate", pitrRule);
  const { value: standbyMode } = useField<string>("standbyMode", required, {
    initialValue: "Hot",
  });
  const { value: streamingMode } = useField<string>("streamingMode", required, {
    initialValue: "Asynchronous",
  });

  const { value: mode } = useField<string>("mode", "", {
    initialValue: "Standalone",
  });
  const { value: monitoring } = useField<boolean>("monitoring");
  const { value: alert } = useField<string>("alert", alertRules);
  const { value: backup } = useField<boolean>("backup");
  const { value: archiver } = useField<boolean>("archiver");
  const { value: tls } = useField<boolean>("tls");
  const { value: clusterIssuer } = useField<string>(
    "clusterIssuer",
    clusterIssuerRule
  );
  const { value: expose } = useField<boolean>("expose");

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
    AuthPassword,
    AuthSecret,
    pitr,
    pitrNamespace,
    pitrName,
    alert,
    standbyMode,
    streamingMode,
    clusterIssuer,
    labels,
    annotations,
    mode,
    monitoring,
    backup,
    tls,
    archiver,
    expose,
    remoteReplica,
    pitrDate,
    validate,
  };
};
