import { ref } from "vue";
import { useRules } from "../../composables/rules";
import { useCreateForm } from "./create";

import {
  StorageClassType,
  VersionType,
  NameSpacesType,
  IssuerType,
  StreamingModeType,
  StandbyModeType,
  authSecretType,
  NameType,
  ModeType,
  ReplicaType,
  MachineType,
  CPUType,
  MemoryType,
  StorageSizeType,
  DeletionPolicyType,
  LabelsType,
  AnnotationsType,
  DbConfigurationType,
  PitrNamespaceType,
  PitrNameType,
  AlertType,
  authPasswordType,
  MonitoringType,
  BackupType,
  ArchiverType,
  TLSType,
  ExposeType,
  RemoteReplicaType,
} from "types/type";

//Hard-coded options
const databaseModes = ref<Array<{ value: string; label: string }>>([
  { label: "Standalone", value: "Standalone" },
  { label: "HA Cluster", value: "Cluster" },
  { label: "RemoteReplica", value: "RemoteReplica" },
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
    label: "Delete (Keep only database authSecrets and backed up data)",
    value: "Delete",
  },
  {
    label: "Halt (Keep PVCs, database authSecrets and backed up data)",
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
    authPassword,
    authSecret,
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
    RemoteReplica,
  } = useCreateForm();

  const AdvancedToggleSwitch = ref({
    DbConfig: true,
    AuthCred: true,
    Pitr: true,
  });

  // Basic Config generics
  const genericNameSpaces = ref<NameSpacesType>({
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

  const genericVersions = ref<VersionType>({
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

  const genericName = ref<NameType>({
    show: true,
    disabled: false,
    label: "Name",
    placeholder: "Database Name",
    required: true,
    rules: [required],
    minHeight: 30,
    nameModel: name,
  });

  const genericStorageSize = ref<StorageSizeType>({
    show: true,
    disabled: false,
    label: "Storage Size",
    placeholder: "Input Storage Size",
    required: true,
    rules: [required],
    minHeight: 30,
    storageSizeModel: storageSize,
  });

  const genericStorageClass = ref<StorageClassType>({
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

  const genericDeletionPolicy = ref<DeletionPolicyType>({
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

  const genericReplica = ref<ReplicaType>({
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

  const genericMachine = ref<MachineType>({
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

  const genericCPU = ref<CPUType>({
    show: true,
    label: "cpu",
    placeholder: "cpu limits",
    baseUnit: "core",
    cpuModel: cpu,
    min: 0,
  });

  const genericMemory = ref<MemoryType>({
    show: true,
    label: "Memory",
    placeholder: "memory limits",
    baseUnit: "Gi",
    memoryModel: memory,
    min: 0,
  });

  const genericMode = ref<ModeType>({
    show: true,
    label: "Database Mode",
    options: databaseModes.value,
    row: true,
    modeModel: mode,
  });

  // Advanced Config generics
  const genericLabels = ref<LabelsType>({
    show: true,
    labelsModel: labels,
    protectedKeys: [],
    toggleFilter: true,
    addLabel: "Add Labels",
    addIcon: "",
    readAllowed: false,
    valueCanBeEmpty: true,
  });

  const genericAnnotations = ref<AnnotationsType>({
    show: true,
    annotationsModel: annotations,
    addLabel: "Add Annotations",
    addIcon: "",
    readAllowed: false,
    valueCanBeEmpty: true,
  });

  const genericDbConfiguration = ref<DbConfigurationType>({
    show: true,
    dbConfigurationModel: dbConfiguration,
    minHeight: 120,
  });

  const genericauthPassword = ref<authPasswordType>({
    show: true,
    disabled: false,
    label: "authPassword (Leave it blank to auto generate authPassword)",
    placeholder: "",
    minHeight: 30,
    authPasswordModel: authPassword,
  });

  const genericauthSecret = ref<authSecretType>({
    show: true,
    options: [],
    placeholder: "Select authSecret",
    authSecretModel: authSecret,
  });

  const genericStandbyMode = ref<StandbyModeType>({
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

  const genericPitrNamespace = ref<PitrNamespaceType>({
    show: true,
    label: "Namespace",
    placeholder: "PITR Namespace",
    minHeight: 30,
    pitrNamespaceModel: pitrNamespace,
  });

  const genericPitrName = ref<PitrNameType>({
    show: true,
    label: "Name",
    placeholder: "PITR Name",
    minHeight: 30,
    pitrNameModel: pitrName,
  });

  const genericStreamingMode = ref<StreamingModeType>({
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
  const genericAlert = ref<AlertType>({
    show: true,
    options: alertsList.value,
    label: "Alert Options",
    alertModel: alert,
  });

  const genericIssuer = ref<IssuerType>({
    show: true,
    options: [],
    label: "Cluster Issuers",
    issuerModel: clusterIssuer,
  });

  const genericMonitoring = ref<MonitoringType>({
    show: false,
    monitoringModel: monitoring,
  });

  const genericBackup = ref<BackupType>({
    show: false,
    backupModel: backup,
  });

  const genericArchiver = ref<ArchiverType>({
    show: false,
    archiverModel: archiver,
  });

  const genericTlS = ref<TLSType>({
    show: false,
    tlsModel: tls,
  });

  const genericExpose = ref<ExposeType>({
    show: false,
    exposeModel: expose,
  });

  const RemoteReplicaProps = ref<RemoteReplicaType>({
    show: true,
    disabled: false,
    options: [],
    label: "RemoteReplica",
    placeholder: "Remote Replica",
    required: true,
    rules: [required],
    remoteReplicaModel: RemoteReplica,
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
    authPassword,
    authSecret,
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
    genericauthPassword,
    genericauthSecret,
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
    RemoteReplicaProps,
  };
};