import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAlerts } from "@/context/AlertContext";
// severity removed

const Decision = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { alerts, updateStatus } = useAlerts();
  const alert = alerts.find((a) => a.id === Number(id));
  const [decided, setDecided] = useState(false);
  const [decision, setDecision] = useState<"confirmed" | "ignored" | null>(null);

  if (!alert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Alert not found</p>
      </div>
    );
  }

  const handleConfirm = () => {
    updateStatus(alert.id, "confirmed");
    setDecision("confirmed");
    setDecided(true);
    toast.success("Crack confirmed — maintenance team notified");
    setTimeout(() => navigate("/alerts"), 1800);
  };

  const handleIgnore = () => {
    updateStatus(alert.id, "ignored");
    setDecision("ignored");
    setDecided(true);
    toast("Alert marked as ignored");
    setTimeout(() => navigate("/alerts"), 1800);
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="header-gradient text-primary-foreground px-5 pt-14 pb-8 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => navigate(-1)} className="bg-white/10 p-2.5 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Decision Required</h1>
            <p className="text-xs opacity-75">Alert #{alert.id}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {/* Alert Summary */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-destructive/10 p-3 rounded-xl">
              <AlertTriangle className="text-destructive" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-foreground text-lg">{alert.type}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <span className="text-xs text-warning font-medium">Action Pending</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="text-accent" size={14} />
              <span>{alert.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={14} />
              <span>{alert.time}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
            {alert.description}
          </p>
        </div>

        {/* Human-in-the-loop */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-3">
          <p className="text-xs text-accent font-medium text-center">
            🧑‍💼 Human-in-the-loop verification required before proceeding
          </p>
        </div>

        {/* Action Buttons */}
        {!decided ? (
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleConfirm}
              className="w-full h-14 text-base font-semibold bg-success hover:bg-success/90 text-success-foreground gap-3 shadow-lg shadow-success/20"
            >
              <CheckCircle2 size={22} />
              Confirm Crack
            </Button>
            <Button
              onClick={handleIgnore}
              variant="outline"
              className="w-full h-14 text-base font-semibold gap-3 text-muted-foreground border-2"
            >
              <XCircle size={22} />
              Ignore Alert
            </Button>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              decision === "confirmed" ? "bg-success/10" : "bg-muted"
            }`}>
              {decision === "confirmed" ? (
                <CheckCircle2 className="text-success" size={40} />
              ) : (
                <XCircle className="text-muted-foreground" size={40} />
              )}
            </div>
            <p className="font-bold text-lg text-foreground">
              {decision === "confirmed" ? "Crack Confirmed" : "Alert Ignored"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {decision === "confirmed" ? "Maintenance team has been notified" : "Alert has been archived"}
            </p>
            <p className="text-xs text-muted-foreground mt-3">Redirecting to alerts...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Decision;
