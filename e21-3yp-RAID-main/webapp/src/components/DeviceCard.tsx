import React from "react";
import { 
  Wifi, MapPin, AlertTriangle, Camera, TrendingUp
} from "lucide-react";
import { CrackEvent } from "@/hooks/useTelemetry";
import { Button } from "@/components/ui/button";

interface DeviceCardProps {
  deviceId: string;
  deviceName: string;
  isReal: boolean; // true for real device, false for mock
  isConnected: boolean;
  liveCracks: CrackEvent[];
  onViewDetails: () => void;
  onCrackClick?: (crack: CrackEvent) => void; // New: click on individual crack
}

export default function DeviceCard({
  deviceId,
  deviceName,
  isReal,
  isConnected,
  liveCracks,
  onViewDetails,
  onCrackClick
}: DeviceCardProps) {
  
  const total = liveCracks.length;
  const highSeverity = liveCracks.filter(c => c.severity === 'HIGH').length;

  return (
    <div className={`rounded-2xl shadow-md overflow-hidden border-2 transition-all hover:shadow-lg ${
      isReal 
        ? 'bg-white border-amber-300' 
        : 'bg-slate-50 border-slate-200'
    }`}>
      
      {/* ================= HEADER ================= */}
      <div className={`px-6 py-4 ${
        isReal 
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200' 
          : 'bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {deviceName}
            </h3>
            <p className="text-xs text-slate-500 font-mono">{deviceId}</p>
          </div>
          
          {/* Data source badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isReal 
              ? 'bg-amber-100 text-amber-700 border border-amber-300' 
              : 'bg-indigo-100 text-indigo-700 border border-indigo-300'
          }`}>
            {isReal ? '🔴 REAL DATA' : '📊 MOCK DATA'}
          </div>
        </div>
        
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? 'bg-emerald-400' : 'bg-red-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? 'bg-emerald-500' : 'bg-red-500'
            }`}></span>
          </span>
          <p className="text-xs text-slate-600">
            {isConnected ? '● Live' : '● Disconnected'}
          </p>
        </div>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="px-6 py-4 bg-white">
        <div className="grid grid-cols-2 gap-3 mb-4">
          
          {/* Total Detections */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold">Total Cracks</span>
              <TrendingUp size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
          </div>
          
          {/* High Severity Count */}
          <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-700 font-semibold">Critical Alerts</span>
              <AlertTriangle size={16} className="text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-600 mt-1">{highSeverity}</p>
          </div>
        </div>
      </div>

      {/* ================= RECENT DETECTIONS ================= */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Recent Detections</h4>
        
        {liveCracks.length === 0 ? (
          <div className="text-xs text-slate-400 italic text-center py-3">
            No detections yet
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {liveCracks.slice(0, 4).map((crack, idx) => (
              <button
                key={idx}
                onClick={() => onCrackClick?.(crack)}
                className="w-full flex items-center justify-between bg-slate-50 hover:bg-blue-50 rounded p-2 text-xs transition-colors cursor-pointer border border-transparent hover:border-blue-200"
              >
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{crack.km?.toFixed(1)} km</p>
                  <p className="text-slate-500">{new Date(crack.timestamp || '').toLocaleTimeString()}</p>
                </div>
                <div className={`px-2 py-1 rounded font-bold whitespace-nowrap ml-2 ${
                  crack.status === 'approved' 
                    ? 'bg-emerald-100 text-emerald-700'
                    : crack.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {crack.status || 'pending'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= ACTION BUTTON ================= */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <Button 
          onClick={onViewDetails}
          className={`w-full font-semibold ${
            isReal
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
