import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wifi, MapPin, Bell, Map, FileText,
  ChevronRight, LogOut, Camera, AlertTriangle, Grid3x3, List
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useUltrasonicTelemetry } from "@/hooks/useUltrasonicTelemetry";
import { useMockTelemetry } from "@/hooks/useMockTelemetry";
import DeviceCard from "@/components/DeviceCard";
import CrackDetailModal from "@/components/CrackDetailModal";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Load balancing demo: show 3 devices
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedCrack, setSelectedCrack] = useState<any>(null);
  const [showCrackDetail, setShowCrackDetail] = useState(false);

  // Device 1: Real data from backend
  const device1 = useTelemetry("esp-001", "IR_Bottom");

  const ultrasonic = useUltrasonicTelemetry("esp-001", "ULTRASONIC");

  // Device 2: Mock data
  const device2 = useMockTelemetry("esp-002-mock", "IR_Bottom");

  // Device 3: Mock data
  const device3 = useMockTelemetry("esp-003-mock", "IR_Bottom");

  // Total number of detected events across all devices
  const totalCracks = device1.liveCracks.length + device2.liveCracks.length + device3.liveCracks.length;
  const totalCritical = [device1, device2, device3]
    .flatMap(d => d.liveCracks)
    .filter(c => c.severity === 'HIGH').length;

  // Load Balancing Metrics
  const device1Load = device1.liveCracks.length;
  const device2Load = device2.liveCracks.length;
  const device3Load = device3.liveCracks.length;

  const device1Percent = totalCracks > 0 ? Math.round((device1Load / totalCracks) * 100) : 0;
  const device2Percent = totalCracks > 0 ? Math.round((device2Load / totalCracks) * 100) : 0;
  const device3Percent = totalCracks > 0 ? Math.round((device3Load / totalCracks) * 100) : 0;

  const avgLoad = totalCracks > 0 ? Math.round(totalCracks / 3) : 0;
  const loadBalance = Math.round(((Math.max(device1Load, device2Load, device3Load) - Math.min(device1Load, device2Load, device3Load)) / Math.max(1, avgLoad)) * 100);
  const isBalanced = loadBalance < 30;

  // Logout user and redirect to home page
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Handle device detail view
  const handleViewDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setViewMode('detailed');
  };

  // Handle crack click to open detail modal
  const handleCrackClick = (crack: any) => {
    setSelectedCrack(crack);
    setShowCrackDetail(true);
  };

  // Handle crack status update
  const handleCrackStatusUpdate = (crackId: string | number, newStatus: 'pending' | 'approved' | 'ignored') => {
    // Update the crack status in the appropriate device's liveCracks array
    const updateCrackInDevice = (cracks: any[]) => {
      return cracks.map(c =>
        (c.id === crackId || c.id?.toString() === crackId?.toString())
          ? { ...c, status: newStatus }
          : c
      );
    };

    // Find which device has this crack and update it
    const device1Updated = updateCrackInDevice(device1.liveCracks);
    const device2Updated = updateCrackInDevice(device2.liveCracks);
    const device3Updated = updateCrackInDevice(device3.liveCracks);

    // Update selected crack if it's the one being updated
    if (selectedCrack?.id === crackId || selectedCrack?.id?.toString() === crackId?.toString()) {
      setSelectedCrack({ ...selectedCrack, status: newStatus });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">

      {/* ================= HEADER SECTION ================= */}
      <div className="bg-slate-900 rounded-b-[2rem] px-6 py-8 shadow-lg">

        {/* Title + connection status */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Mission Control
            </h1>
            <p className="text-sm text-slate-400 mt-1">Load Balancing Demo • {new Date().toLocaleString()}</p>
          </div>

          {/* Logout button */}
          <Button onClick={handleLogout} variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
            <LogOut size={20} />
          </Button>
        </div>

        {/* Fleet Overview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Detections</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCracks}</p>
          </div>
          <div className="bg-rose-900 rounded-lg px-4 py-3 border border-rose-700">
            <p className="text-xs text-rose-200 uppercase font-semibold">Critical Alerts</p>
            <p className="text-2xl font-bold text-rose-200 mt-1">{totalCritical}</p>
          </div>
          <div className="bg-emerald-900 rounded-lg px-4 py-3 border border-emerald-700 col-span-2">
            <p className="text-xs text-emerald-200 uppercase font-semibold">Fleet Status</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-emerald-200">esp-001: Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-emerald-200">esp-002-mock: Streaming</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-emerald-200">esp-003-mock: Streaming</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            className="text-sm"
          >
            <Grid3x3 size={16} className="mr-1" />
            Fleet Overview
          </Button>
          <Button
            onClick={() => setViewMode('detailed')}
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            className="text-sm"
          >
            <List size={16} className="mr-1" />
            Detailed View
          </Button>
        </div>

        {/* Load Balancing Analytics */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h3 className="text-sm font-bold text-slate-300 uppercase mb-4">📊 Load Distribution</h3>

          <div className="space-y-3">
            {/* Device 1 Load Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300 font-semibold">esp-001 (Real)</span>
                <span className="text-xs font-bold text-amber-300">{device1Percent}% ({device1Load} events)</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(device1Percent, 5)}%` }}
                ></div>
              </div>
            </div>

            {/* Device 2 Load Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300 font-semibold">esp-002 (Mock)</span>
                <span className="text-xs font-bold text-indigo-300">{device2Percent}% ({device2Load} events)</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(device2Percent, 5)}%` }}
                ></div>
              </div>
            </div>

            {/* Device 3 Load Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300 font-semibold">esp-003 (Mock)</span>
                <span className="text-xs font-bold text-cyan-300">{device3Percent}% ({device3Load} events)</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(device3Percent, 5)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Load Balance Status */}
          <div className={`mt-4 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${isBalanced
              ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
              : 'bg-amber-900 text-amber-200 border border-amber-700'
            }`}>
            <span className={`inline-flex h-2 w-2 rounded-full ${isBalanced ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            {isBalanced ? '✓ Load Balanced' : '⚠ Imbalanced Load'} • Variance: {loadBalance}%
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="px-6 mt-8">

        {viewMode === 'grid' ? (
          /* ========== GRID VIEW: 3 Device Cards ========== */
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Device Fleet</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Device 1: Real Data */}
              <DeviceCard
                deviceId="esp-001"
                deviceName="Robot-01"
                isReal={true}
                isConnected={device1.isConnected}
                liveCracks={device1.liveCracks}
                onViewDetails={() => handleViewDevice("esp-001")}
                onCrackClick={handleCrackClick}
              />

              {/* Device 2: Mock Data */}
              <DeviceCard
                deviceId="esp-002-mock"
                deviceName="Robot-02"
                isReal={false}
                isConnected={device2.isConnected}
                liveCracks={device2.liveCracks}
                onViewDetails={() => handleViewDevice("esp-002-mock")}
                onCrackClick={handleCrackClick}
              />

              {/* Device 3: Mock Data */}
              <DeviceCard
                deviceId="esp-003-mock"
                deviceName="Robot-03"
                isReal={false}
                isConnected={device3.isConnected}
                liveCracks={device3.liveCracks}
                onViewDetails={() => handleViewDevice("esp-003-mock")}
                onCrackClick={handleCrackClick}
              />
            </div>
          </>
        ) : (
          /* ========== DETAILED VIEW: Single Device Details ========== */
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={() => setViewMode('grid')}
                variant="outline"
                size="sm"
              >
                ← Back to Fleet
              </Button>
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedDevice === 'esp-001' && 'Robot-01 Details'}
                {selectedDevice === 'esp-002-mock' && 'Robot-02 Details (Mock)'}
                {selectedDevice === 'esp-003-mock' && 'Robot-03 Details (Mock)'}
              </h2>
            </div>

            {selectedDevice === 'esp-001' && (
              <DetailedDeviceView
                deviceId="esp-001"
                deviceName="Robot-01"
                isReal={true}
                liveCracks={device1.liveCracks}
                onCrackClick={handleCrackClick}
              />
            )}
            {selectedDevice === 'esp-002-mock' && (
              <DetailedDeviceView
                deviceId="esp-002-mock"
                deviceName="Robot-02 (Mock)"
                isReal={false}
                liveCracks={device2.liveCracks}
                onCrackClick={handleCrackClick}
              />
            )}
            {selectedDevice === 'esp-003-mock' && (
              <DetailedDeviceView
                deviceId="esp-003-mock"
                deviceName="Robot-03 (Mock)"
                isReal={false}
                liveCracks={device3.liveCracks}
                onCrackClick={handleCrackClick}
              />
            )}
          </>
        )}
      </div>

      {/* Crack Detail Modal */}
      <CrackDetailModal
        crack={selectedCrack}
        isOpen={showCrackDetail}
        onClose={() => setShowCrackDetail(false)}
        onStatusUpdate={handleCrackStatusUpdate}
      />
      {/* ================= ULTRASONIC PANEL ================= */}
      <div className="px-6 mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Panel Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">🚧 Obstacle Detection</h2>
              <p className="text-xs text-slate-400 mt-0.5">HC-SR04 Ultrasonic Sensor • esp-001</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${ultrasonic.isConnected
                ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                : 'bg-slate-700 text-slate-400'
              }`}>
              <span className={`inline-flex h-2 w-2 rounded-full ${ultrasonic.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}></span>
              {ultrasonic.isConnected ? 'Live' : 'Offline'}
            </div>
          </div>

          {/* Latest Reading */}
          {ultrasonic.liveUltrasonic.length > 0 && (
            <div className={`px-6 py-4 border-b border-slate-100 ${ultrasonic.liveUltrasonic[0].obstacleDetected
                ? 'bg-rose-50'
                : 'bg-emerald-50'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Latest Reading</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {ultrasonic.liveUltrasonic[0].distanceCm.toFixed(1)}
                    <span className="text-lg font-normal text-slate-500 ml-1">cm</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(ultrasonic.liveUltrasonic[0].timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-bold ${ultrasonic.liveUltrasonic[0].obstacleDetected
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                  {ultrasonic.liveUltrasonic[0].obstacleDetected ? '⚠️ OBSTACLE' : '✅ CLEAR'}
                </div>
              </div>
            </div>
          )}

          {/* History Table */}
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Time</th>
                <th className="p-4 font-semibold text-slate-600">Distance</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ultrasonic.liveUltrasonic.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400 italic">
                    No ultrasonic data yet. Hold an object in front of HC-SR04.
                  </td>
                </tr>
              ) : (
                ultrasonic.liveUltrasonic.slice(0, 10).map((event, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {event.distanceCm.toFixed(1)} cm
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${event.obstacleDetected
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {event.obstacleDetected ? '⚠️ Obstacle' : '✅ Clear'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Bottom navigation bar */}
      <BottomNav />
    </div>
  );
}

/**
 * Detailed view component showing all crack detections for a single device
 */
function DetailedDeviceView({ 
  deviceId, 
  deviceName, 
  isReal, 
  liveCracks,
  onCrackClick
}: {
  deviceId: string;
  deviceName: string;
  isReal: boolean;
  liveCracks: any[];
  onCrackClick: (crack: any) => void;
}) {
  const total = liveCracks.length;
  const pending = liveCracks.filter(c => c.status === 'pending' || c.status !== 'ignored').length;

  return (
    <>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-600 font-semibold">Total Detections</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-600 font-semibold">Pending Review</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{pending}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-600 font-semibold">Data Source</p>
          <p className={`text-sm font-bold mt-2 ${isReal ? 'text-amber-600' : 'text-indigo-600'}`}>
            {isReal ? '🔴 Real Data' : '📊 Mock Data'}
          </p>
        </div>
      </div>

      {/* Detailed table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Time</th>
              <th className="p-4 font-semibold text-slate-600">Location</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {liveCracks.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                  No detections yet. Awaiting telemetry data.
                </td>
              </tr>
            ) : (
              liveCracks.map((crack, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">
                    {crack.timestamp ? new Date(crack.timestamp).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="text-slate-900 font-medium">{crack.km?.toFixed(1)} km</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      {crack.gps?.lat?.toFixed(4)} N, {crack.gps?.lng?.toFixed(4)} E
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${crack.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : crack.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                      {crack.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCrackClick(crack)}
                      className="font-semibold"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}