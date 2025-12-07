export enum ModuleID {
  OVERVIEW = 'OVERVIEW',
  NETWORK = 'NETWORK',
  LOGIC = 'LOGIC',
  ANALYTICS = 'ANALYTICS'
}

export interface ModuleConfig {
  id: ModuleID;
  label: string;
  coords: { x: string; y: string };
}