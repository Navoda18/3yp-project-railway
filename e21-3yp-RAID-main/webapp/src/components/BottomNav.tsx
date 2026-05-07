import { Home, Bell, Map, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAlerts } from "@/context/AlertContext";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts } = useAlerts();
  const pendingCount = alerts.filter((a) => a.status === "pending").length;

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Map, label: "Map", path: "/map" },
    { icon: FileText, label: "Reports", path: "/reports" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all relative ${
                active ? "bottom-nav-active" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
