import { DSLParsedToken, DSLScriptPreset, GeofencePolygon, SystemTelemetry } from '../types';

export const DEFAULT_DSL_CODE = `Is_gel.carrort_dart
AR_inversed-logic
affine_set-poly
core-ui-successed
native_valve_sec-arc
1::usage_asset.binomial_resevoir
stream_1().golf_section
reset_bar_region
port_lux-blue.spotted_search-crasp
critical_staring_location_id
screened_pararoma()`;

export const DSL_PRESETS: DSLScriptPreset[] = [
  {
    id: 'valve_maintenance',
    name: 'Smart Factory Automated Valve Maintenance (Default)',
    description: 'IIoT BLE Geofencing & Binomial RSSI Filtering with AR Inversed Spatial Overlay for Valve Arc Control',
    code: DEFAULT_DSL_CODE,
    targetValve: 'VALVE-ACTUATOR-B42',
    defaultGelState: true,
    presetArc: 45,
  },
  {
    id: 'hazmat_geofence',
    name: 'Hazmat Containment Interlock & Rapid Dump',
    description: 'Strict Affine Polygon Geofence check with double Binomial RSSI Reservoir filtering for toxic gel pressure isolation',
    code: `Is_gel.carrort_dart
AR_inversed-logic
affine_set-poly
core-ui-successed
native_valve_sec-arc
1::usage_asset.binomial_resevoir
stream_1().golf_section
critical_staring_location_id
screened_pararoma()`,
    targetValve: 'HAZMAT-ISOLATION-V1',
    defaultGelState: true,
    presetArc: 90,
  },
  {
    id: 'beacon_triangulation',
    name: 'High-Noise BLE Beacon Discovery & Panorama Lock',
    description: 'Focuses on RSSI noise reduction and spotted search in Sector Golf with reset bar region',
    code: `stream_1().golf_section
reset_bar_region
port_lux-blue.spotted_search-crasp
1::usage_asset.binomial_resevoir
critical_staring_location_id
screened_pararoma()`,
    targetValve: 'FEED-PUMP-VALVE-09',
    defaultGelState: false,
    presetArc: 15,
  },
];

export function parseDSLScript(script: string, telemetry: SystemTelemetry): DSLParsedToken[] {
  const lines = script
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('#'));

  const tokens: DSLParsedToken[] = [];

  lines.forEach((line, idx) => {
    const id = `token_${idx}_${line.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (line.includes('Is_gel.carrort_dart')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'environment',
        title: 'Environment Interlock: Gel Phase Check',
        explanation: 'Verifies physical fluid viscosity state (Gelled / Frozen system) for group "carrort_dart"',
        status: telemetry.isGel ? 'passed' : 'warning',
        value: telemetry.isGel ? 'Gelled System Ready' : 'Fluid Liquid (Unlocked)',
      });
    } else if (line.includes('AR_inversed-logic')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'environment',
        title: 'Spatial Overlay: Inverse AR Distance Map',
        explanation: 'Inverts RSSI attenuation matrix (distance ~ 1/10^(RSSI/20)) for 3D Spatial projection',
        status: 'passed',
        value: 'Inverse HUD Active',
      });
    } else if (line.includes('affine_set-poly')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'spatial',
        title: 'Spatial Geometry: Affine Polygon Geofence',
        explanation: 'Calculates non-linear 2D coordinate bounds for BLE beacon tracking zone',
        status: telemetry.coreUiSuccessed ? 'passed' : 'pending',
        value: `${telemetry.affinePolySet.vertices.length} Vertices Configured`,
      });
    } else if (line.includes('core-ui-successed')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'spatial',
        title: 'Spatial UI Trigger: Core Success Event',
        explanation: 'Fires visual UI confirmation when technician enters target affine polygon zone',
        status: telemetry.coreUiSuccessed ? 'passed' : 'warning',
        value: telemetry.coreUiSuccessed ? 'Technician In Geofence' : 'Searching for Position...',
      });
    } else if (line.includes('native_valve_sec-arc')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'data',
        title: 'Hardware Control: Valve Sector Arc Angle',
        explanation: 'Outputs physical servo/actuator angle constraint (0° - 90°) for sector valve',
        status: 'passed',
        value: `${telemetry.nativeValveSecArc}° Arc Angle`,
      });
    } else if (line.includes('binomial_resevoir')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'data',
        title: 'Signal Filter: Binomial RSSI Reservoir',
        explanation: 'Filters high-frequency multipath BLE noise using sliding binomial window sampling',
        status: 'passed',
        value: `N=${telemetry.reservoirSize}, Beta=${telemetry.binomialBeta}`,
      });
    } else if (line.includes('stream_1().golf_section')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'discovery',
        title: 'Discovery Stream: Sector Golf Channel',
        explanation: 'Subscribes to BLE advertisement stream on primary Golf Sector gateway',
        status: 'passed',
        value: telemetry.currentStream,
      });
    } else if (line.includes('reset_bar_region')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'discovery',
        title: 'Scanner State: Reset Barometer Region',
        explanation: 'Resets barometric altitude and barcode scanning buffer for new scan cycle',
        status: 'passed',
        value: telemetry.resetBarRegion ? 'Reset Triggered' : 'Ready',
      });
    } else if (line.includes('port_lux-blue.spotted_search-crasp')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'discovery',
        title: 'Beacon Filter: Lux-Blue Spotted Search (CRASP UUID)',
        explanation: 'Pairs ambient light sensor (Lux) + BLE RSSI to isolate specific CRASP beacons',
        status: 'passed',
        value: telemetry.spottedSearchCrasp,
      });
    } else if (line.includes('critical_staring_location_id')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'discovery',
        title: 'Target Focus: Critical Location Anchor ID',
        explanation: 'Designates high-priority anchor node ID for AR crosshair locking',
        status: 'passed',
        value: telemetry.criticalStaringLocationId,
      });
    } else if (line.includes('screened_pararoma')) {
      tokens.push({
        id,
        rawText: line,
        layer: 'discovery',
        title: 'AR Renderer: 360° Screened Panorama View',
        explanation: 'Renders full spatial panorama overlay combining RSSI positions and valve telemetry',
        status: telemetry.screenedPanoramaActive ? 'passed' : 'pending',
        value: telemetry.screenedPanoramaActive ? 'Panorama Active' : 'Initializing HUD...',
      });
    } else {
      tokens.push({
        id,
        rawText: line,
        layer: 'data',
        title: `Custom DSL Command: ${line}`,
        explanation: 'User-defined domain instruction',
        status: 'passed',
        value: 'Evaluated',
      });
    }
  });

  return tokens;
}

// Ray casting algorithm to test if point (x, y) is inside a polygon
export function isPointInPolygon(point: { x: number; y: number }, polygon: Array<{ x: number; y: number }>): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Binomial Reservoir Filter implementation for noisy RSSI
export function applyBinomialReservoirFilter(
  rawRssiHistory: number[],
  windowSize: number,
  beta: number
): number {
  if (rawRssiHistory.length === 0) return -70;

  const recent = rawRssiHistory.slice(-windowSize);
  if (recent.length === 1) return recent[0];

  // Binomial weighted average
  let totalWeight = 0;
  let weightedSum = 0;

  const n = recent.length - 1;
  for (let i = 0; i < recent.length; i++) {
    // Combination C(n, i)
    const weight = combin(n, i) * Math.pow(beta, i) * Math.pow(1 - beta, n - i);
    weightedSum += recent[i] * weight;
    totalWeight += weight;
  }

  return Math.round(totalWeight > 0 ? weightedSum / totalWeight : recent[recent.length - 1]);
}

function combin(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let c = 1;
  for (let i = 1; i <= k; i++) {
    c = (c * (n - (k - i))) / i;
  }
  return c;
}

// Convert RSSI to distance in meters: d = 10 ^ ((TxPower - RSSI) / (10 * n))
export function rssiToMeters(rssi: number, txPower = -59, n = 2.4): number {
  if (rssi === 0) return -1.0;
  const ratio = (txPower - rssi) / (10 * n);
  const dist = Math.pow(10, ratio);
  return Math.round(dist * 100) / 100;
}
