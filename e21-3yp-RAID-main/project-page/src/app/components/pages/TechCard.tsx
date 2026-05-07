import React from "react";

interface TechCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  colorClass: string;
}

export const TechCard: React.FC<TechCardProps> = ({ icon, name, description, colorClass }) => (
  <div
    className={`flex flex-col items-center justify-center bg-white rounded-2xl shadow-md ${colorClass} p-6 min-w-[180px] min-h-[210px] transition-transform hover:-translate-y-1 hover:shadow-lg`}
    style={{ gap: 16 }}
  >
    <div className="flex items-center justify-center w-14 h-14 rounded-xl mb-4" style={{ background: "rgba(0,0,0,0.04)" }}>
      {icon}
    </div>
    <div className="font-bold text-lg text-center mb-1 text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>{name}</div>
    <div className="text-sm text-center text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>{description}</div>
  </div>
);
