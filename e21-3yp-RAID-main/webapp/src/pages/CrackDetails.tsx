import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Camera, Activity, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/context/AlertContext";
import { statusColor } from "@/data/mockData";

const CrackDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { alerts } = useAlerts();
  const alert = alerts.find((a) => a.id === Number(id));

  if (!alert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Alert not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="header-gradient text-primary-foreground px-5 pt-14 pb-8 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => navigate(-1)} className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Crack Details</h1>
            <p className="text-xs opacity-75">Alert #{alert.id} • {alert.location}</p>
          </div>
          <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${statusColor[alert.status].badge}`}>
            {statusColor[alert.status].label}
          </span>
        </div>
      </div>

      <div className="px-5 space-y-4 -mt-4">
        {/* Image Placeholder */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Camera className="text-accent" size={16} />
            <span className="text-sm font-semibold text-foreground">Captured Image</span>
            <span className="text-xs text-muted-foreground ml-auto">{alert.timestamp}</span>
          </div>
          <div className="w-full h-52 bg-muted flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Camera className="text-accent" size={28} />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Robot Camera Image</span>
            <span className="text-xs text-muted-foreground">Image will appear here</span>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="text-accent" size={16} />
            <span className="text-sm font-semibold text-foreground">Location Data</span>
            <button 
              onClick={() => navigate(`/map?focus=${alert.id}`)}
              className="ml-auto flex items-center gap-1 text-xs text-accent font-medium"
            >
              <Navigation size={12} />
              View on Map
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Track Marker</p>
              <p className="font-bold text-foreground mt-0.5">KM {alert.km}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">GPS Coordinates</p>
              <p className="font-bold text-foreground text-sm mt-0.5">{alert.lat.toFixed(4)}°N</p>
              <p className="text-xs text-muted-foreground">{alert.lng.toFixed(4)}°E</p>
            </div>
          </div>
        </div>

        {/* Sensor */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-accent" size={16} />
            <span className="text-sm font-semibold text-foreground">Sensor Readings</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">IR Sensor</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-2 h-2 rounded-full ${alert.irSensor === "Active" ? "bg-success pulse-dot" : "bg-muted-foreground"}`} />
                <span className="text-sm font-semibold text-foreground">{alert.irSensor}</span>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Detection Time</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock size={13} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{alert.timestamp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Description */}
        <div className={`bg-card rounded-2xl p-4 shadow-sm border border-border border-l-4 ${
          alert.status === "pending" ? "border-l-warning" :
          alert.status === "confirmed" ? "border-l-success" : "border-l-muted-foreground"
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3.5 h-3.5 rounded-full ${
              alert.status === "pending" ? "bg-warning animate-pulse" :
              alert.status === "confirmed" ? "bg-success" : "bg-muted-foreground"
            }`} />
            <span className={`text-sm font-bold ${
              alert.status === "pending" ? "text-warning" :
              alert.status === "confirmed" ? "text-success" : "text-muted-foreground"
            }`}>
              {alert.status === "pending" ? "Action Pending" :
               alert.status === "confirmed" ? "Crack Confirmed" : "Alert Ignored"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{alert.description}</p>
        </div>

        {/* Action Button */}
        {alert.status === "pending" ? (
          <Button onClick={() => navigate(`/decision/${alert.id}`)} className="w-full h-13 text-base font-semibold header-gradient border-0">
            Take Action
          </Button>
        ) : (
          <div className={`text-center py-3 rounded-xl ${alert.status === "confirmed" ? "bg-success/10" : "bg-muted"}`}>
            <p className={`font-semibold text-sm ${alert.status === "confirmed" ? "text-success" : "text-muted-foreground"}`}>
              {alert.status === "confirmed" ? "✓ Crack Confirmed" : "✗ Alert Ignored"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrackDetails;
