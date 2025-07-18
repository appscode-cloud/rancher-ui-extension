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

export interface genericNameSpacesType extends BaseCommon {
  namespaceModel: any;
}

export interface genericNameType extends BaseCommon {
  nameModel: any;
}

export interface genericVersionType extends BaseCommon {
  versionModel: any;
}
export interface genericModeType extends BaseCommon {
  modeModel: any;
  row?: boolean;
}

export interface genericReplicaType extends BaseCommon {
  replicaModel: any;
}

export interface genericMachineType extends BaseCommon {
  machineModel: any;
}

export interface genericCPUType extends BaseCommon {
  cpuModel: any;
  baseUnit: string;
  min: number;
}

export interface genericMemoryType extends BaseCommon {
  memoryModel: any;
  baseUnit: string;
  min: number;
}

export interface genericStorageSizeType extends BaseCommon {
  storageSizeModel: any;
}

export interface genericStorageClassType extends BaseCommon {
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
export interface genericLabelsType extends AdvancedBaseCommon {
  labelsModel: any;
}
export interface genericAnnotationsType extends AdvancedBaseCommon {
  annotationsModel: any;
}
export interface genericDeletionPolicyType extends AdvancedBaseCommon {
  deletionPolicyModel: any;
}

export interface genericauthSecretType extends AdvancedBaseCommon {
  authSecretModel: any;
}

export interface genericauthPasswordType extends AdvancedBaseCommon {
  authPasswordModel: any;
}
export interface genericDbConfigurationType extends AdvancedBaseCommon {
  dbConfigurationModel: any;
}
export interface genericPitrNamespaceType extends AdvancedBaseCommon {
  pitrNamespaceModel: any;
}
export interface genericPitrNameType extends AdvancedBaseCommon {
  pitrNameModel: any;
}
export interface genericStreamingModeType extends AdvancedBaseCommon {
  streamingModeModel: any;
}
export interface genericStandbyModeType extends AdvancedBaseCommon {
  standbyModeModel: any;
}
export interface genericAlertType extends BaseCommon {
  alertModel: any;
}

export interface genericIssuerType extends BaseCommon {
  issuerModel: any;
}

export interface genericMonitoring extends BaseCommon {
  monitoringModel: any;
}
export interface genericBackup extends BaseCommon {
  backupModel: any;
}

export interface genericArchiver extends BaseCommon {
  archiverModel: any;
}

export interface genericTLS extends BaseCommon {
  tlsModel: any;
}

export interface genericExpose extends BaseCommon {
  exposeModel: any;
}
