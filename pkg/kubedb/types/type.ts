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
};