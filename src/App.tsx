import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FactoryMapCanvas } from './components/FactoryMapCanvas';
import { ArViewport } from './components/ArViewport';
import { DslEditor } from './components/DslEditor';
import { SignalReservoirChart } from './components/SignalReservoirChart';
import { BleBeaconTable } from './components/BleBeaconTable';
import { AiDslAssistantModal } from './components/AiDslAssistantModal';
import { BLEBeacon, SystemTelemetry } from './types';
import { DEFAULT_DSL_CODE } from './lib/dslParser';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'map' | 'ar' | 'ide' | 'reservoir' | 'beacons'
  >('map');
  const [dslCode, setDslCode] = useState<string>(DEFAULT_DSL_CODE);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);

  // Initial System Telemetry State
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    isGel: true,
    carrortDart: 'DART_VALVE_GROUP_1',
    arInversedLogic: true,
    affinePolySet: {
      id: 'GEOFENCE-POLYGON-GOLF-4',
      name: 'Sector Golf Valve Maintenance Zone',
      vertices: [
        { x: 6.0, y: 3.0 },
        { x: 19.0, y: 3.0 },
        { x: 19.0, y: 13.0 },
        { x: 6.0, y: 13.0 },
      ],
      active: true,
      color: '#06b6d4',
    },
    coreUiSuccessed: true,
    nativeValveSecArc: 45,
    linePressurePsi: 80,
    reservoirSize: 10,
    binomialBeta: 0.5,
    noiseLevel: 6,
    currentStream: 'stream_1().golf_section',
    resetBarRegion: false,
    spottedSearchCrasp: 'UUID_PORT_LUX_BLUE_CRASP_99',
    criticalStaringLocationId: 'VALVE-ACTUATOR-B42',
    screenedPanoramaActive: true,
    technicianPos: { x: 12.5, y: 7.5 },
  });

  // Mock BLE Beacons in Sector Golf
  const [beacons] = useState<BLEBeacon[]>([
    {
      id: 'VALVE-ACTUATOR-B42',
      name: 'Actuator Valve B-42 Anchor',
      uuid: 'UUID_PORT_LUX_BLUE_CRASP_99',
      x: 12.5,
      y: 7.5,
      rssi: -62,
      filteredRssi: -60,
      txPower: -59,
      distance: 0.5,
      battery: 98,
      status: 'locked',
      major: 101,
      minor: 42,
    },
    {
      id: 'PUMP-STATION-GOLF-01',
      name: 'Golf Pump Station #1',
      uuid: 'UUID_PORT_LUX_BLUE_CRASP_14',
      x: 8.0,
      y: 5.0,
      rssi: -74,
      filteredRssi: -71,
      txPower: -59,
      distance: 4.8,
      battery: 84,
      status: 'in_range',
      major: 101,
      minor: 12,
    },
    {
      id: 'GEOFENCE-ANCHOR-NORTH',
      name: 'North Boundary BLE Anchor',
      uuid: 'UUID_PORT_LUX_BLUE_CRASP_33',
      x: 19.0,
      y: 3.0,
      rssi: -81,
      filteredRssi: -79,
      txPower: -59,
      distance: 8.2,
      battery: 91,
      status: 'in_range',
      major: 102,
      minor: 88,
    },
    {
      id: 'BEACON-CRASP-LUX-04',
      name: 'Sector 4 Barometer Beacon',
      uuid: 'UUID_PORT_LUX_BLUE_CRASP_04',
      x: 6.0,
      y: 13.0,
      rssi: -79,
      filteredRssi: -77,
      txPower: -59,
      distance: 8.9,
      battery: 65,
      status: 'out_of_bounds',
      major: 102,
      minor: 94,
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        telemetry={telemetry}
        setTelemetry={setTelemetry}
        onOpenAiModal={() => setAiModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1">
        {activeTab === 'map' && (
          <FactoryMapCanvas
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            beacons={beacons}
          />
        )}

        {activeTab === 'ar' && (
          <ArViewport telemetry={telemetry} setTelemetry={setTelemetry} />
        )}

        {activeTab === 'ide' && (
          <DslEditor
            dslCode={dslCode}
            setDslCode={setDslCode}
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            onOpenAiModal={() => setAiModalOpen(true)}
          />
        )}

        {activeTab === 'reservoir' && (
          <SignalReservoirChart
            telemetry={telemetry}
            setTelemetry={setTelemetry}
          />
        )}

        {activeTab === 'beacons' && (
          <BleBeaconTable
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            beacons={beacons}
          />
        )}
      </main>

      {/* Gemini AI Assistant Modal */}
      <AiDslAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        dslCode={dslCode}
        setDslCode={setDslCode}
        telemetry={telemetry}
      />
    </div>
  );
}
