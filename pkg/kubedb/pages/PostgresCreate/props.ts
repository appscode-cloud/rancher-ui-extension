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
  AuthSecretType,
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
  AuthPasswordType,
  MonitoringType,
  BackupType,
  ArchiverType,
  TLSType,
  ExposeType,
  RemoteReplicaType,
} from "types/type";

//Hard-coded options
const databaseModes = ref<Array<{ value: string; label: string }>>([]);
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
    label: "Delete (Keep only database AuthSecrets and backed up data)",
    value: "Delete",
  },
  {
    label: "Halt (Keep PVCs, database AuthSecrets and backed up data)",
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
    AuthPassword,
    AuthSecret,
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
  const NameSpacesProps = ref<NameSpacesType>({
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

  const VersionsProps = ref<VersionType>({
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

  const NameProps = ref<NameType>({
    show: true,
    disabled: false,
    label: "Name",
    placeholder: "Database Name",
    required: true,
    rules: [required],
    minHeight: 30,
    nameModel: name,
  });

  const StorageSizeProps = ref<StorageSizeType>({
    show: true,
    disabled: false,
    label: "Storage Size",
    placeholder: "Input Storage Size",
    required: true,
    rules: [required],
    minHeight: 30,
    storageSizeModel: storageSize,
  });

  const StorageClassProps = ref<StorageClassType>({
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

  const DeletionPolicyProps = ref<DeletionPolicyType>({
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

  const ReplicaProps = ref<ReplicaType>({
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

  const MachineProps = ref<MachineType>({
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

  const CPUProps = ref<CPUType>({
    show: true,
    label: "cpu",
    placeholder: "cpu limits",
    baseUnit: "core",
    cpuModel: cpu,
    min: 0,
  });

  const MemoryProps = ref<MemoryType>({
    show: true,
    label: "Memory",
    placeholder: "memory limits",
    baseUnit: "Gi",
    memoryModel: memory,
    min: 0,
  });

  const ModeProps = ref<ModeType>({
    show: true,
    label: "Database Mode",
    options: databaseModes.value,
    row: true,
    modeModel: mode,
  });

  // Advanced Config generics
  const LabelsProps = ref<LabelsType>({
    show: true,
    labelsModel: labels,
    protectedKeys: [],
    toggleFilter: true,
    addLabel: "Add Labels",
    addIcon: "",
    readAllowed: false,
    valueCanBeEmpty: true,
  });

  const AnnotationsProps = ref<AnnotationsType>({
    show: true,
    annotationsModel: annotations,
    addLabel: "Add Annotations",
    addIcon: "",
    readAllowed: false,
    valueCanBeEmpty: true,
  });

  const DbConfigurationProps = ref<DbConfigurationType>({
    show: true,
    dbConfigurationModel: dbConfiguration,
    minHeight: 120,
  });

  const AuthPasswordProps = ref<AuthPasswordType>({
    show: true,
    disabled: false,
    label: "AuthPassword (Leave it blank to auto generate AuthPassword)",
    placeholder: "",
    minHeight: 30,
    AuthPasswordModel: AuthPassword,
  });

  const AuthSecretProps = ref<AuthSecretType>({
    show: true,
    options: [],
    placeholder: "Select AuthSecret",
    AuthSecretModel: AuthSecret,
  });

  const StandbyModeProps = ref<StandbyModeType>({
    show: true,
    options: [
      { value: "Hot", label: "Hot" },
      { value: "Warn", label: "Warm" },
    ],
    label: "Standby Mode",
    placeholder: "Select Standby Mode",
    standbyModeModel: standbyMode,
    rules: [required],
    required: true,
  });

  const PitrNamespaceProps = ref<PitrNamespaceType>({
    show: true,
    label: "Namespace",
    placeholder: "PITR Namespace",
    minHeight: 30,
    pitrNamespaceModel: pitrNamespace,
  });

  const PitrNameProps = ref<PitrNameType>({
    show: true,
    label: "Name",
    placeholder: "PITR Name",
    minHeight: 30,
    pitrNameModel: pitrName,
  });

  const StreamingModeProps = ref<StreamingModeType>({
    show: true,
    options: [
      { value: "Asynchronous", label: "Asynchronous" },
      { value: "Synchronous", label: "Synchronous" },
    ],
    label: "Streaming Mode",
    placeholder: "Select Streaming Mode",
    streamingModeModel: streamingMode,
    rules: [required],
    required: true,
  });

  // Additional Options generics
  const AlertProps = ref<AlertType>({
    show: true,
    options: alertsList.value,
    label: "Alert Options",
    alertModel: alert,
  });

  const IssuerProps = ref<IssuerType>({
    show: true,
    options: [],
    label: "Cluster Issuers",
    issuerModel: clusterIssuer,
    rules: [required],
    required: true,
  });

  const MonitoringProps = ref<MonitoringType>({
    show: false,
    monitoringModel: monitoring,
  });

  const BackupProps = ref<BackupType>({
    show: false,
    backupModel: backup,
  });

  const ArchiverProps = ref<ArchiverType>({
    show: false,
    archiverModel: archiver,
  });

  const TLSProps = ref<TLSType>({
    show: false,
    tlsModel: tls,
  });

  const ExposeProps = ref<ExposeType>({
    show: false,
    exposeModel: expose,
  });

  const RemoteReplicaProps = ref<RemoteReplicaType>({
    show: true,
    disabled: false,
    options: [],
    label: "RemoteReplica",
    placeholder: "",
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
    AuthPassword,
    AuthSecret,
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
    NameSpacesProps,
    VersionsProps,
    NameProps,
    StorageSizeProps,
    StorageClassProps,
    DeletionPolicyProps,
    ReplicaProps,
    MachineProps,
    CPUProps,
    MemoryProps,
    ModeProps,
    LabelsProps,
    AnnotationsProps,
    DbConfigurationProps,
    AuthPasswordProps,
    AuthSecretProps,
    StandbyModeProps,
    PitrNamespaceProps,
    PitrNameProps,
    StreamingModeProps,
    AlertProps,
    IssuerProps,
    MonitoringProps,
    BackupProps,
    ArchiverProps,
    TLSProps,
    ExposeProps,
    RemoteReplicaProps,
  };
};
