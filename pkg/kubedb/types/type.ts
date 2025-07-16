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
  namespaceModel: Ref<string, string>;
}

export interface genericNameType extends BaseCommon {
  nameModel: Ref<string, string>;
}

export interface genericVersionType extends BaseCommon {
  versionModel: Ref<string, string>;
}
export interface genericModeType extends BaseCommon {
  modeModel: Ref<string, string>;
  row?: boolean;
}

export interface genericReplicaType extends BaseCommon {
  replicaModel: Ref<string, string>;
}

export interface genericMachineType extends BaseCommon {
  machineModel: Ref<string, string>;
}

export interface genericCPUType extends BaseCommon {
  cpuModel: Ref<string, string>;
  baseUnit: string;
  min: number;
}

export interface genericMemoryType extends BaseCommon {
  memoryModel: Ref<string, string>;
  baseUnit: string;
  min: number;
}

export interface genericStorageSizeType extends BaseCommon {
  storageSizeModel: Ref<string, string>;
}

export interface genericStorageClassType extends BaseCommon {
  storageClassModel: Ref<string, string>;
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
  labelsModel: Ref<string, string>;
}
export interface genericAnnotationsType extends AdvancedBaseCommon {
  annotationsModel: Ref<string, string>;
}
export interface genericDeletionPolicyType extends AdvancedBaseCommon {
  deletionPolicyModel: Ref<string, string>;
}

export interface genericSecretType extends AdvancedBaseCommon {
  secretModel: Ref<string, string>;
}

export interface genericPasswordType extends AdvancedBaseCommon {
  passwordModel: Ref<string, string>;
}
export interface genericDbConfigurationType extends AdvancedBaseCommon {
  dbConfigurationModel: Ref<string, string>;
}
export interface genericPitrNamespaceType extends AdvancedBaseCommon {
  pitrNamespaceModel: Ref<string, string>;
}
export interface genericPitrNameType extends AdvancedBaseCommon {
  pitrNameModel: Ref<string, string>;
}
export interface genericStreamingModeType extends AdvancedBaseCommon {
  streamingModeModel: Ref<string, string>;
}
export interface genericStandbyModeType extends AdvancedBaseCommon {
  standbyModeModel: Ref<string, string>;
}
export interface genericAlertType extends BaseCommon {
  alertModel: Ref<string, string>;
}

export interface genericIssuerType extends BaseCommon {
  issuerModel: Ref<string, string>;
}
