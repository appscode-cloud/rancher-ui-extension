import {Ref} from "vue"
export type genericOption = {
  show?: boolean;
  disabled?: boolean;
  options?: Array<{
    label: string;
    value: string;
  }> 
  ;
  searchable?: boolean;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
  rules?: Array<(value: unknown) => string>;
  clearable?: boolean;
  label?: string;
  minHeight?: number;
  namespaceModel?: string;
  nameModel?: string;
  versionModel?: string;
  storageSizeModel?: string;
  storageClassModel?: string;
  replicaModel?: string;
  machineModel?: string;
  baseUnit?: string;
  cpuModel?: string;
  min?: number;
  memoryModel?: string;
  row?: boolean;
  modeModel?:string;
  deletionPolicyModel?: string;
  labelsModel?: Record<string, string>;
  annotationsModel?: Record<string, string>;
  dbConfigurationModel?: string;
  passwordModel?: string;
  secretModel?: string;
  standbyModeModel?: string;
  pitrNamespaceModel?: string;
  pitrNameModel?: string;
  streamingModeModel?: string;
  protectedKeys?: string[];
  toggleFilter?: boolean;
  addLabel?: string;
  addIcon?: string;
  readAllowed?: boolean;
  valueCanBeEmpty?: boolean;
};