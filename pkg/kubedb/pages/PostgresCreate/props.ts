import { ref } from "vue";
import { useRules } from "../../composables/rules";
import { useCreateForm } from "./create";

import {
  genericStorageClassType,
  genericVersionType,
  genericNameSpacesType,
  genericIssuerType,
  genericStreamingModeType,
  genericStandbyModeType,
  genericSecretType,
  genericNameType,
  genericModeType,
  genericReplicaType,
  genericMachineType,
  genericCPUType,
  genericMemoryType,
  genericStorageSizeType,
  genericDeletionPolicyType,
  genericLabelsType,
  genericAnnotationsType,
  genericDbConfigurationType,
  genericPitrNamespaceType,
  genericPitrNameType,
  genericAlertType,
  genericPasswordType,
  genericMonitoring,
  genericBackup,
  genericArchiver,
  genericTLS,
  genericExpose,
} from "types/type";

//Hard-coded options
const databaseModes = ref<Array<{ value: string; label: string }>>([
  { label: "standalone", value: "standalone" },
  { label: "HA", value: "HA" },
  { label: "replica", value: "replica" },
]);
const alertsList = ref<Array<{ value: string; label: string }>>([
  { label: "Critical", value: "Critical" },
  { label: "Info", value: "Info" },
  { label: "None", value: "None" },
  { label: "Warning", value: "Warning" },
]);
const machines = ref<Array<{ value: string; label: string }>>([
  { label: "custom", value: "custom" },
  { label: "db.t.micro", value: "db.t.micro" },
  { label: "db.t.small", value: "db.t.small" },
  { label: "db.t.medium", value: "db.t.medium" },
  { label: "db.t.large", value: "db.t.large" },
]);
const deletionPolicies = ref<Array<{ value: string; label: string }>>([
  {
    label: "Delete (Keep only database Secrets and backed up data)",
    value: "Delete",
  },
  {
    label: "Halt (Keep PVCs, database Secrets and backed up data)",
    value: "Halt",
  },
  {
    label: "WipeOut (Delete everything including backed up data )",
    value: "WipeOut",
  },
  {
    label: "DoNotTerminate (Prevent deletion of the Postgres CRD)",
    value: "DoNotTerminate",
  },
]);

const { required } = useRules();

export const useProps = () => {
  const {
    validate,
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
    pitrName,
    pitrNamespace,
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
  } = useCreateForm();

  const AdvancedToggleSwitch = ref({
    DbConfig: true,
    AuthCred: true,
    Pitr: true,
  });

  // Basic Config generics
  const genericNameSpaces = ref<genericNameSpacesType>({
    show: true,
    disabled: false,
    options: [],
    searchable: true,
    multiple: false,
    label: "Namespace",
    placeholder: "Select Namespace",
    required: true,
    rules: [required],
    clearable: true,
    namespaceModel: namespace,
  });

  const genericVersions = ref<genericVersionType>({
    show: true,
    disabled: false,
    options: [],
    searchable: true,
    multiple: false,
    label: "Version",
    placeholder: "Select Version",
    required: true,
    rules: [required],
    clearable: true,
    versionModel: version,
  });

  const genericName = ref<genericNameType>({
    show: true,
    disabled: false,
    label: "Name",
    placeholder: "Database Name",
    required: true,
    rules: [required],
    minHeight: 30,
    nameModel: name,
  });

  const genericStorageSize = ref<genericStorageSizeType>({
    show: true,
    disabled: false,
    label: "Storage Size",
    placeholder: "Input Storage Size",
    required: true,
    rules: [required],
    minHeight: 30,
    storageSizeModel: storageSize,
  });

  const genericStorageClass = ref<genericStorageClassType>({
    show: true,
    disabled: false,
    label: "Storage Class",
    placeholder: "Select Storage Class",
    required: true,
    rules: [required],
    searchable: true,
    options: [],
    multiple: false,
    storageClassModel: storageClass,
  });

  const genericDeletionPolicy = ref<genericDeletionPolicyType>({
    show: true,
    disabled: false,
    options: deletionPolicies.value,
    searchable: true,
    multiple: false,
    label: "Deletion Policy",
    placeholder: "Select Deletion Policy",
    required: true,
    rules: [required],
    clearable: true,
    deletionPolicyModel: deletionPolicy,
  });

  const genericReplica = ref<genericReplicaType>({
    show: true,
    disabled: false,
    label: "Replicas",
    placeholder: "",
    required: true,
    rules: [required],
    clearable: true,
    minHeight: 30,
    replicaModel: replicas,
  });

  const genericMachine = ref<genericMachineType>({
    show: true,
    options: machines.value,
    searchable: true,
    multiple: false,
    label: "Machine Profile",
    placeholder: "Select machine",
    machineModel: machine,
    required: true,
    rules: [required],
  });

  const genericCPU = ref<genericCPUType>({
    show: true,
    label: "cpu",
    placeholder: "cpu limits",
    baseUnit: "core",
    cpuModel: cpu,
    min: 0,
  });

  const genericMemory = ref<genericMemoryType>({
    show: true,
    label: "Memory",
    placeholder: "memory limits",
    baseUnit: "Gi",
    memoryModel: memory,
    min: 0,
  });

  const genericMode = ref<genericModeType>({
    show: true,
    label: "Database Mode",
    options: databaseModes.value,
    row: true,
    modeModel: mode,
  });

  // Advanced Config generics
  const genericLabels = ref<genericLabelsType>({
    show: true,
    labelsModel: labels,
    protectedKeys: [],
    toggleFilter: true,
    addLabel: "Add Labels",
    addIcon: "",
    readAllowed: false,
    valueCanBeEmpty: true,
  });

  const genericAnnotations = ref<genericAnnotationsType>({
    show: true,
    annotationsModel: annotations,
    addLabel: "Add Annotations",
    addIcon: "",
    readAllowed: false,
    valueCanBeEmpty: true,
  });

  const genericDbConfiguration = ref<genericDbConfigurationType>({
    show: true,
    dbConfigurationModel: dbConfiguration,
    minHeight: 120,
  });

  const genericPassword = ref<genericPasswordType>({
    show: true,
    disabled: false,
    label: "Password (Leave it blank to auto generate password)",
    placeholder: "",
    minHeight: 30,
    passwordModel: password,
  });

  const genericSecret = ref<genericSecretType>({
    show: true,
    options: [],
    placeholder: "Select Secret",
    secretModel: secret,
  });

  const genericStandbyMode = ref<genericStandbyModeType>({
    show: true,
    options: [
      { value: "Asynchronous", label: "Asynchronous" },
      { value: "Synchronous", label: "Synchronous" },
    ],
    label: "Standby Mode",
    placeholder: "Select Standby Mode",
    standbyModeModel: standbyMode,
    rules: [required],
    required: true,
  });

  const genericPitrNamespace = ref<genericPitrNamespaceType>({
    show: true,
    label: "Namespace",
    placeholder: "PITR Namespace",
    minHeight: 30,
    pitrNamespaceModel: pitrNamespace,
  });

  const genericPitrName = ref<genericPitrNameType>({
    show: true,
    label: "Name",
    placeholder: "PITR Name",
    minHeight: 30,
    pitrNameModel: pitrName,
  });

  const genericStreamingMode = ref<genericStreamingModeType>({
    show: true,
    options: [
      { value: "Hot", label: "Hot" },
      { value: "Warn", label: "Warm" },
    ],
    label: "Streaming Mode",
    placeholder: "Select Streaming Mode",
    streamingModeModel: streamingMode,
    rules: [required],
    required: true,
  });

  // Additional Options generics
  const genericAlert = ref<genericAlertType>({
    show: true,
    options: alertsList.value,
    label: "Alert Options",
    alertModel: alert,
  });

  const genericIssuer = ref<genericIssuerType>({
    show: true,
    options: [],
    label: "Cluster Issuers",
    issuerModel: clusterIssuer,
  });

  const genericMonitoring = ref<genericMonitoring>({
    show: false,
    monitoringModel: monitoring,
  });

  const genericBackup = ref<genericBackup>({
    show: false,
    backupModel: backup,
  });

  const genericArchiver = ref<genericArchiver>({
    show: false,
    archiverModel: archiver,
  });

  const genericTlS = ref<genericTLS>({
    show: false,
    tlsModel: tls,
  });

  const genericExpose = ref<genericExpose>({
    show: false,
    exposeModel: expose,
  });

  return {
    validate,
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
    pitrName,
    pitrNamespace,
    alert,
    standbyMode,
    streamingMode,
    clusterIssuer,
    labels,
    annotations,
    mode,
    AdvancedToggleSwitch,
    genericNameSpaces,
    genericVersions,
    genericName,
    genericStorageSize,
    genericStorageClass,
    genericDeletionPolicy,
    genericReplica,
    genericMachine,
    genericCPU,
    genericMemory,
    genericMode,
    genericLabels,
    genericAnnotations,
    genericDbConfiguration,
    genericPassword,
    genericSecret,
    genericStandbyMode,
    genericPitrNamespace,
    genericPitrName,
    genericStreamingMode,
    genericAlert,
    genericIssuer,
    genericMonitoring,
    genericBackup,
    genericArchiver,
    genericTlS,
    genericExpose,
  };
};
