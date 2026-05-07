import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Navigation, X, Clock, Camera, CheckCircle2, XCircle, AlertTriangle, Bot } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { useAlerts, type CrackAlert } from "@/context/AlertContext";
import { severityColor, statusColor } from "@/data/mockData";

// Custom marker icons
const createIcon = (color: string, size: number = 12) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${size * 2}px; height: ${size * 2}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
  });
};

const robotIcon = L.divIcon({
  className: "robot-marker",
  html: `<div style="
    width: 36px; height: 36px;
    background: linear-gradient(135deg, hsl(215, 70%, 18%), hsl(215, 55%, 32%));
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    animation: pulse 2s ease-in-out infinite;
  ">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const LiveMap = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const robotMarkerRef = useRef<L.Marker | null>(null);
  const trackLayerRef = useRef<L.Polyline | null>(null);
  const alertLayerRef = useRef<L.LayerGroup | null>(null);
  const { alerts, robotStatus } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<CrackAlert | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([robotStatus.lat, robotStatus.lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Robot marker
    robotMarkerRef.current = L.marker([robotStatus.lat, robotStatus.lng], { icon: robotIcon }).addTo(map);
    robotMarkerRef.current.bindTooltip("🤖 Robot - KM " + robotStatus.km, {
      permanent: false,
      direction: "top",
      offset: [0, -20],
    });

    trackLayerRef.current = L.polyline([], {
      color: "hsl(215, 70%, 25%)",
      weight: 3,
      opacity: 0.3,
      dashArray: "10 6",
    }).addTo(map);

    alertLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      robotMarkerRef.current = null;
      trackLayerRef.current = null;
      alertLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) {
      return;
    }

    if (robotMarkerRef.current) {
      robotMarkerRef.current.setLatLng([robotStatus.lat, robotStatus.lng]);
      robotMarkerRef.current.setTooltipContent("🤖 Robot - KM " + robotStatus.km);
    }

    const alertPoints: L.LatLngExpression[] = alerts.map((alert) => [alert.lat, alert.lng]);
    const trackPoints: L.LatLngExpression[] = [[robotStatus.lat, robotStatus.lng], ...alertPoints];

    if (trackLayerRef.current) {
      trackLayerRef.current.setLatLngs(trackPoints);
    }

    if (alertLayerRef.current) {
      alertLayerRef.current.clearLayers();

      alerts.forEach((alert) => {
        let color: string;
        let size: number;

        if (alert.status === "confirmed") {
          color = "hsl(0, 75%, 55%)";
          size = 14;
        } else if (alert.status === "ignored") {
          color = "hsl(215, 15%, 70%)";
          size = 10;
        } else if (alert.severity === "HIGH") {
          color = "hsl(0, 75%, 55%)";
          size = 14;
        } else if (alert.severity === "MEDIUM") {
          color = "hsl(35, 90%, 55%)";
          size = 12;
        } else {
          color = "hsl(215, 60%, 45%)";
          size = 10;
        }

        const marker = L.marker([alert.lat, alert.lng], { icon: createIcon(color, size) });
        marker.on("click", () => setSelectedAlert(alert));
        marker.addTo(alertLayerRef.current!);

        if (focusId && alert.id === Number(focusId)) {
          map.setView([alert.lat, alert.lng], 16);
          setSelectedAlert(alert);
        }
      });
    }
  }, [alerts, focusId, robotStatus.lat, robotStatus.lng, robotStatus.km]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Live Map" subtitle="Robot & crack locations" icon={<Navigation className="text-primary-foreground" size={24} />} />

      <div className="px-5 mt-5 space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full header-gradient border-2 border-card flex items-center justify-center">
              <Bot className="text-primary-foreground" size={8} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Robot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive border-2 border-card" />
            <span className="text-xs text-muted-foreground">Confirmed / High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-warning border-2 border-card" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-accent border-2 border-card" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 border-2 border-card" />
            <span className="text-xs text-muted-foreground">Ignored</span>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[420px] rounded-2xl overflow-hidden border border-border shadow-md">
          <div ref={mapRef} className="w-full h-full" />

          {/* Selected Alert Detail */}
          {selectedAlert && (
            <div className="absolute bottom-3 left-3 right-3 glass-card rounded-xl p-4 shadow-xl border border-border z-[1000] animate-in slide-in-from-bottom-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedAlert.status === "confirmed" ? (
                    <CheckCircle2 className="text-success" size={18} />
                  ) : selectedAlert.status === "ignored" ? (
                    <XCircle className="text-muted-foreground" size={18} />
                  ) : (
                    <AlertTriangle className="text-destructive" size={18} />
                  )}
                  <span className="font-bold text-foreground">{selectedAlert.location}</span>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1 rounded-lg hover:bg-muted"
                  aria-label="Close alert details"
                  title="Close alert details"
                >
                  <X className="text-muted-foreground" size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityColor[selectedAlert.severity].badge}`}>
                  {selectedAlert.severity}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[selectedAlert.status].badge}`}>
                  {statusColor[selectedAlert.status].label}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">Confidence: {selectedAlert.confidence}%</span>
              </div>

              <div className="flex gap-3">
                <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Camera className="text-muted-foreground" size={18} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={11} />
                    <span>{selectedAlert.time} • {selectedAlert.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={11} />
                    <span>{selectedAlert.lat.toFixed(4)}°N, {selectedAlert.lng.toFixed(4)}°E</span>
                  </div>
                  <button
                    onClick={() => navigate(`/crack/${selectedAlert.id}`)}
                    className="text-xs font-semibold text-accent hover:underline mt-1"
                  >
                    View Full Details →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-2xl font-bold text-destructive">{alerts.filter((a) => a.status === "confirmed").length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confirmed</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-2xl font-bold text-warning">{alerts.filter((a) => a.status === "pending").length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-2xl font-bold text-muted-foreground">{alerts.filter((a) => a.status === "ignored").length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ignored</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default LiveMap;
