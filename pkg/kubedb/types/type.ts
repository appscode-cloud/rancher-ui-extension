interface BaseCommon {
  show?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
  rules?: Array<(value: unknown) => string>;
  clearable?: boolean;
  label?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
  minHeight?: number;
}

export interface NameSpacesType extends BaseCommon {
  namespaceModel: any;
}

export interface NameType extends BaseCommon {
  nameModel: any;
}

export interface VersionType extends BaseCommon {
  versionModel: any;
}
export interface ModeType extends BaseCommon {
  modeModel: any;
  row?: boolean;
}

export interface ReplicaType extends BaseCommon {
  replicaModel: any;
}

export interface MachineType extends BaseCommon {
  machineModel: any;
}

export interface CPUType extends BaseCommon {
  cpuModel: any;
  baseUnit: string;
  min: number;
}

export interface MemoryType extends BaseCommon {
  memoryModel: any;
  baseUnit: string;
  min: number;
}

export interface StorageSizeType extends BaseCommon {
  storageSizeModel: any;
}

export interface StorageClassType extends BaseCommon {
  storageClassModel: any;
}

export interface AdvancedBaseCommon extends BaseCommon {
  protectedKeys?: string[];
  toggleFilter?: boolean;
  addLabel?: string;
  addIcon?: string;
  readAllowed?: boolean;
  valueCanBeEmpty?: boolean;
}
export interface LabelsType extends AdvancedBaseCommon {
  labelsModel: any;
}
export interface AnnotationsType extends AdvancedBaseCommon {
  annotationsModel: any;
}
export interface DeletionPolicyType extends AdvancedBaseCommon {
  deletionPolicyModel: any;
}

export interface authSecretType extends AdvancedBaseCommon {
  authSecretModel: any;
}

export interface authPasswordType extends AdvancedBaseCommon {
  authPasswordModel: any;
}
export interface DbConfigurationType extends AdvancedBaseCommon {
  dbConfigurationModel: any;
}
export interface PitrNamespaceType extends AdvancedBaseCommon {
  pitrNamespaceModel: any;
}
export interface PitrNameType extends AdvancedBaseCommon {
  pitrNameModel: any;
}
export interface StreamingModeType extends AdvancedBaseCommon {
  streamingModeModel: any;
}
export interface StandbyModeType extends AdvancedBaseCommon {
  standbyModeModel: any;
}
export interface AlertType extends BaseCommon {
  alertModel: any;
}

export interface IssuerType extends BaseCommon {
  issuerModel: any;
}

export interface MonitoringType extends BaseCommon {
  monitoringModel: any;
}
export interface BackupType extends BaseCommon {
  backupModel: any;
}

export interface ArchiverType extends BaseCommon {
  archiverModel: any;
}

export interface TLSType extends BaseCommon {
  tlsModel: any;
}

export interface ExposeType extends BaseCommon {
  exposeModel: any;
}
