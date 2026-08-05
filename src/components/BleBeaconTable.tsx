import React from 'react';
import {
  Radio,
  Search,
  Filter,
  BatteryCharging,
  Zap,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { BLEBeacon, SystemTelemetry } from '../types';

interface BleBeaconTableProps {
  telemetry: SystemTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<SystemTelemetry>>;
  beacons: BLEBeacon[];
}

export const BleBeaconTable: React.FC<BleBeaconTableProps> = ({
  telemetry,
  setTelemetry,
  beacons,
}) => {
  const handleLockAnchor = (beaconId: string) => {
    setTelemetry((prev) => ({
      ...prev,
      criticalStaringLocationId: beaconId,
    }));
  };

  const handleResetScanRegion = () => {
    setTelemetry((prev) => ({
      ...prev,
      resetBarRegion: true,
    }));
    setTimeout(() => {
      setTelemetry((prev) => ({
        ...prev,
        resetBarRegion: false,
      }));
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              BLE Discovery Matrix (<code className="text-purple-300">stream_1().golf_section</code>)
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Active advertisement stream filtering spotted CRASP beacons (<code className="text-purple-300">port_lux-blue.spotted_search-crasp</code>).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetScanRegion}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition-all cursor-pointer shadow"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span>
              {telemetry.resetBarRegion ? 'Resetting Barometer...' : 'reset_bar_region'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">Target UUID Search:</span>
            <span className="text-purple-300 font-bold bg-slate-900 px-2.5 py-1 rounded border border-purple-800">
              {telemetry.spottedSearchCrasp}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Gateway Channel: 37/38/39</span>
            <span>Mode: Spotted Search CRASP</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Beacon Name / ID</th>
                <th className="py-3.5 px-4 font-semibold">UUID / Major:Minor</th>
                <th className="py-3.5 px-4 font-semibold">Raw RSSI</th>
                <th className="py-3.5 px-4 font-semibold">Filtered RSSI</th>
                <th className="py-3.5 px-4 font-semibold">Est. Distance</th>
                <th className="py-3.5 px-4 font-semibold">Battery %</th>
                <th className="py-3.5 px-4 font-semibold">Status Lock</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
              {beacons.map((b) => {
                const isSelected =
                  telemetry.criticalStaringLocationId === b.id;

                return (
                  <tr
                    key={b.id}
                    className={`transition-colors hover:bg-slate-800/50 ${
                      isSelected ? 'bg-purple-950/30' : ''
                    }`}
                  >
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span>{b.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      <div>{b.uuid}</div>
                      <div className="text-[10px] text-slate-500">
                        Maj: {b.major} | Min: {b.minor}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-red-400 font-bold">
                      {b.rssi} dBm
                    </td>

                    <td className="py-4 px-4 text-cyan-400 font-bold">
                      {b.filteredRssi} dBm
                    </td>

                    <td className="py-4 px-4 text-emerald-400 font-bold">
                      {b.distance}m
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${b.battery}%` }}
                            className={`h-full ${
                              b.battery > 50
                                ? 'bg-emerald-500'
                                : b.battery > 20
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <span className="text-slate-300">{b.battery}%</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-bold">
                          CRITICAL ANCHOR LOCKED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 text-[10px]">
                          DISCOVERED
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleLockAnchor(b.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Locked Anchor' : 'Lock Anchor'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
