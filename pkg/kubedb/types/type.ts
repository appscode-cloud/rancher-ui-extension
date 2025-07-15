
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
  }> ;
  minHeight?: number;
}

export interface genericNameSpacesType extends BaseCommon {
  namespaceModel: string;
}

export interface genericNameType extends BaseCommon {
  nameModel: string;
}

export interface genericVersionType extends BaseCommon {
  versionModel: string;
}
export interface genericModeType extends BaseCommon {
  modeModel: string;
  row?: boolean;
}

export interface genericReplicaType extends BaseCommon {
  replicaModel: string;
}

export interface genericMachineType extends BaseCommon {
  machineModel: string;
}

export interface genericCPUType extends BaseCommon {
  cpuModel: string;
  baseUnit: string;
  min: number;
}

export interface genericMemoryType extends BaseCommon {
  memoryModel: string;
  baseUnit: string;
  min: number;
}

export interface genericStorageSizeType extends BaseCommon {
  storageSizeModel: string;
}

export interface genericStorageClassType extends BaseCommon {
  storageClassModel: string;
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
  labelsModel: Record<string, string>;
}
export interface genericAnnotationsType extends AdvancedBaseCommon {
  annotationsModel: Record<string, string>;
}
export interface genericDeletionPolicyType extends AdvancedBaseCommon {
  deletionPolicyModel: string;
}

export interface genericSecretType extends AdvancedBaseCommon  {
  secretModel: string;
}

export interface genericPasswordType extends AdvancedBaseCommon {
  passwordModel: string;
}
export interface genericDbConfigurationType extends AdvancedBaseCommon {
  dbConfigurationModel: string;
}
export interface genericPitrNamespaceType extends AdvancedBaseCommon {
  pitrNamespaceModel: string;
}
export interface genericPitrNameType extends AdvancedBaseCommon {
  pitrNameModel: string;
}
export interface genericStreamingModeType extends AdvancedBaseCommon {
  streamingModeModel: string;
}
export interface genericStandbyModeType extends AdvancedBaseCommon {
  standbyModeModel: string;
} 
export interface genericAlertType extends BaseCommon {
  alertModel: string;
}

export interface genericIssuerType extends BaseCommon {
  issuerModel: string;
}