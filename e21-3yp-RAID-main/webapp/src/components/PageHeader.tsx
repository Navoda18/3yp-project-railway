import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const PageHeader = ({ title, subtitle, icon, children }: PageHeaderProps) => (
  <div className="header-gradient text-primary-foreground px-5 pt-14 pb-8 rounded-b-[2rem] relative overflow-hidden">
    {/* Decorative circles */}
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
    <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
    
    <div className="flex items-center justify-between relative z-10">
      <div>
        {subtitle && <p className="text-sm opacity-75 mb-0.5">{subtitle}</p>}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {icon && <div className="bg-white/10 p-3 rounded-2xl">{icon}</div>}
    </div>
    {children && <div className="relative z-10 mt-4">{children}</div>}
  </div>
);

export default PageHeader;
