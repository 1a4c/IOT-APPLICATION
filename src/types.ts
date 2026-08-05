export interface BLEBeacon {
  id: string;
  name: string;
  uuid: string;
  x: number; // in meters relative to floor
  y: number;
  rssi: number; // dBm
  filteredRssi: number; // dBm after reservoir filter
  txPower: number; // dBm at 1m
  distance: number; // estimated meters
  battery: number; // percentage
  status: 'locked' | 'in_range' | 'out_of_bounds';
  major: number;
  minor: number;
}

export interface GeofencePolygon {
  id: string;
  name: string;
  vertices: Array<{ x: number; y: number }>;
  active: boolean;
  color: string;
}

export interface DSLScriptPreset {
  id: string;
  name: string;
  description: string;
  code: string;
  targetValve: string;
  defaultGelState: boolean;
  presetArc: number;
}

export interface DSLParsedToken {
  id: string;
  rawText: string;
  layer: 'environment' | 'spatial' | 'data' | 'discovery';
  title: string;
  explanation: string;
  status: 'passed' | 'warning' | 'pending' | 'executing';
  value?: string | number | boolean;
}

export interface SystemTelemetry {
  isGel: boolean;
  carrortDart: string;
  arInversedLogic: boolean;
  affinePolySet: GeofencePolygon;
  coreUiSuccessed: boolean;
  nativeValveSecArc: number; // 0 to 90 degrees
  linePressurePsi: number;
  reservoirSize: number;
  binomialBeta: number;
  noiseLevel: number;
  currentStream: string;
  resetBarRegion: boolean;
  spottedSearchCrasp: string;
  criticalStaringLocationId: string;
  screenedPanoramaActive: boolean;
  technicianPos: { x: number; y: number };
}

export interface AiAnalysisResult {
  summary: string;
  layerBreakdown: Record<string, string>;
  recommendations: string[];
  optimizedDsl: string;
}
