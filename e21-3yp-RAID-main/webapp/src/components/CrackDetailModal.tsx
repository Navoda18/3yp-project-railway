import React, { useState } from "react";
import { X, MapPin, Clock, CheckCircle, XCircle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrackEvent } from "@/hooks/useTelemetry";

interface CrackDetailModalProps {
  crack: CrackEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (crackId: string | number, status: 'pending' | 'approved' | 'ignored') => void;
}

export default function CrackDetailModal({
  crack,
  isOpen,
  onClose,
  onStatusUpdate
}: CrackDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMap, setShowMap] = useState(false);

  if (!isOpen || !crack) return null;

  const locationLabel = (() => {
    const location = crack.location;
    if (typeof location === "string" && location.trim().length > 0) {
      return location;
    }

    if (location && typeof location === "object") {
      const lat = Number((location as any).lat);
      const lng = Number((location as any).lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
      }
    }

    return "Railway Track Section";
  })();

  const resolvedImageUrl =
    crack.imageUrl ||
    crack.image_url ||
    crack.media?.imageUrl ||
    crack.media?.image_url ||
    crack.media?.s3Url ||
    crack.media?.s3_url ||
    crack.media?.url;

  const handleApprove = async () => {
    setIsUpdating(true);
    onStatusUpdate(crack.id || '', 'approved');
    setTimeout(() => {
      setIsUpdating(false);
      onClose();
    }, 500);
  };

  const handleIgnore = async () => {
    setIsUpdating(true);
    onStatusUpdate(crack.id || '', 'ignored');
    setTimeout(() => {
      setIsUpdating(false);
      onClose();
    }, 500);
  };

  const openMapInNewTab = () => {
    const lat = crack.gps?.lat || 28.6155;
    const lng = crack.gps?.lng || 77.2100;
    window.open(
      `https://www.google.com/maps/?q=${lat},${lng}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* ================= HEADER ================= */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 px-6 py-6 flex items-center justify-between border-b-4 border-blue-600">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Crack Details</h2>
            <p className="text-blue-100 text-sm mt-1">
              Alert #{crack.id} • {locationLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              crack.status === 'approved'
                ? 'bg-emerald-200 text-emerald-700'
                : crack.status === 'ignored'
                ? 'bg-slate-200 text-slate-600'
                : 'bg-amber-200 text-amber-700'
            }`}>
              {crack.status?.toUpperCase() || 'PENDING'}
            </span>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white p-1 rounded-lg hover:bg-blue-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-6 space-y-6">
          
          {/* ================= IMAGE SECTION ================= */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📸</span>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Captured Image</h3>
              {crack.timestamp && (
                <span className="text-xs text-slate-500 ml-auto">
                  {new Date(crack.timestamp).toLocaleString()}
                </span>
              )}
            </div>
            <div className="w-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border-2 border-slate-300 overflow-hidden aspect-video flex items-center justify-center">
              {resolvedImageUrl ? (
                <img
                  src={resolvedImageUrl}
                  alt="Track Defect"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", resolvedImageUrl);
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              ) : (
                <div className="text-center">
                  <MapPin size={48} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-semibold">Robot Camera Image</p>
                  <p className="text-slate-400 text-sm">Image will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* ================= LOCATION DATA ================= */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                Location Data
              </h3>
              <button
                onClick={openMapInNewTab}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                <Map size={16} />
                View on Map
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Track Marker */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Track Marker</p>
                <p className="text-3xl font-bold text-blue-900">KM {crack.km?.toFixed(1)}</p>
              </div>

              {/* GPS Coordinates */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">GPS Coordinates</p>
                <p className="text-sm font-bold text-green-900">
                  {crack.gps?.lat?.toFixed(4)}° N
                </p>
                <p className="text-sm font-bold text-green-900">
                  {crack.gps?.lng?.toFixed(4)}° E
                </p>
              </div>
            </div>
          </div>

          {/* ================= SENSOR READINGS ================= */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Sensor Readings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 font-bold uppercase mb-1">Detection Type</p>
                <p className="text-sm font-semibold text-slate-900">{crack.type || 'IR Detection'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-bold uppercase mb-1">Detection Time</p>
                <p className="text-sm font-semibold text-slate-900">
                  {crack.timestamp ? new Date(crack.timestamp).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* ================= ANALYSIS ================= */}
          {crack.description && (
            <div className={`rounded-lg p-4 border-l-4 ${
              crack.status === 'approved'
                ? 'bg-emerald-50 border-emerald-400'
                : crack.status === 'ignored'
                ? 'bg-slate-50 border-slate-400'
                : 'bg-amber-50 border-amber-400'
            }`}>
              <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Analysis Details</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {crack.description}
              </p>
            </div>
          )}

          {/* ================= ACTION BUTTONS ================= */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            
            {/* Confirm Button */}
            <Button
              onClick={handleApprove}
              disabled={isUpdating || crack.status === 'approved'}
              className={`flex-1 font-bold py-3 flex items-center justify-center gap-2 text-lg ${
                crack.status === 'approved'
                  ? 'bg-emerald-200 text-emerald-700 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              <CheckCircle size={20} />
              {crack.status === 'approved' ? 'Confirmed' : 'Confirm'}
            </Button>

            {/* Ignore Button */}
            <Button
              onClick={handleIgnore}
              disabled={isUpdating || crack.status === 'ignored'}
              className={`flex-1 font-bold py-3 flex items-center justify-center gap-2 text-lg ${
                crack.status === 'ignored'
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-500 hover:bg-slate-600 text-white'
              }`}
            >
              <XCircle size={20} />
              {crack.status === 'ignored' ? 'Ignored' : 'Ignore'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
