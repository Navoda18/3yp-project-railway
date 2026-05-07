import { useState, useRef } from "react";
import { FileText, Calendar, TrendingUp, Download, ShieldCheck, Zap } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { useTelemetry } from "@/hooks/useTelemetry";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const tabs = ["Daily", "Weekly", "Monthly"] as const;

const Reports = () => {
  const [active, setActive] = useState<typeof tabs[number]>("Daily");
  const reportRef = useRef<HTMLDivElement>(null);

  // Real-time data from both robots
  const device1 = useTelemetry("esp-001", "IR_Bottom");
  const device2 = useTelemetry("esp-002", "IR_Bottom");

  const combinedCracks = [...device1.liveCracks, ...device2.liveCracks];
  const total = combinedCracks.length;

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf_height = pdf.internal.pageSize.getHeight();
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf_height;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf_height;
      }

      pdf.save(`rail-sight-guard-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="Reports" subtitle="Inspection summaries & analytics" icon={<FileText className="text-primary-foreground" size={24} />} />

      <div className="px-5 mt-5 space-y-5" ref={reportRef}>
        {/* Tabs and Download Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  active === tab
                    ? "header-gradient text-primary-foreground shadow-md"
                    : "bg-card border border-border text-foreground hover:bg-secondary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Button
            onClick={downloadPDF}
            size="sm"
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Download size={16} />
            PDF
          </Button>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <h3 className="font-bold text-foreground">Today's Summary</h3>
            </div>
            <span className="text-xs bg-accent/10 text-accent font-medium px-2.5 py-1 rounded-full">Feb 9, 2026</span>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="stat-blue rounded-xl p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Detections</p>
              <p className="text-3xl font-bold text-foreground mt-1">{total}</p>
            </div>
          </div>

          <div className="space-y-4 pt-3 border-t border-border">
            <h4 className="font-bold text-sm text-foreground mb-2">Crack Detection Details</h4>
            {combinedCracks.length > 0 ? (
              <div className="space-y-4">
                {combinedCracks.map((crack, idx) => (
                  <div key={crack.id || idx} className="bg-secondary/30 rounded-lg p-3 border border-border/50 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-muted-foreground font-semibold">Location (GPS)</p>
                        <p className="text-foreground">
                          Lat: {crack.gps?.latitude ?? crack.gps?.lat ?? 'N/A'}, 
                          Long: {crack.gps?.longitude ?? crack.gps?.lng ?? 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-semibold">Device / Sensor</p>
                        <p className="text-foreground">{crack.deviceId} / {crack.sensorId}</p>
                      </div>
                    </div>
                    {crack.imageUrl && (
                      <div className="mt-2">
                        <p className="text-muted-foreground font-semibold mb-1">Evidence Image</p>
                        <img 
                          src={crack.imageUrl} 
                          alt="Crack detection" 
                          className="w-full h-32 object-cover rounded-md border border-border"
                          crossOrigin="anonymous"
                        />
                        <p className="text-[10px] text-primary truncate mt-1">{crack.imageUrl}</p>
                      </div>
                    )}
                    <div className="mt-2 text-[10px] text-muted-foreground flex justify-between">
                      <span>Severity: {crack.severity}</span>
                      <span>Time: {new Date(crack.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No detections reported in this period.</p>
            )}
            
            <div className="flex justify-between text-sm pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Fleet Status</span>
              <span className="font-semibold text-emerald-500">
                {(device1.isConnected ? 1 : 0) + (device2.isConnected ? 1 : 0)}/2 Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Reports;
