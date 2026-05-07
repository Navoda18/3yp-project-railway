import { Outlet, Link, useLocation } from "react-router";
import { Train, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/architecture", label: "Architecture" },
    { path: "/tech-stack", label: "Tech Stack" },
    { path: "/budget", label: "Budget" },
    { path: "/team", label: "Team" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center group-hover:from-blue-700 group-hover:to-blue-800 transition-all">
                <Train className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-lg leading-none">RAID</span>
                <span className="text-xs text-slate-500">Railway Track Monitoring System</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Train className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-lg">RAID</div>
                  <div className="text-xs text-slate-400">Railway Track Monitoring System</div>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Autonomous IoT-based railway track crack detection for safer, smarter infrastructure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/architecture" className="hover:text-blue-400 transition-colors">
                    Architecture
                  </Link>
                </li>
                <li>
                  <Link to="/tech-stack" className="hover:text-blue-400 transition-colors">
                    Technology Stack
                  </Link>
                </li>
                <li>
                  <Link to="/team" className="hover:text-blue-400 transition-colors">
                    Our Team
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Project Info</h3>
              <p className="text-sm text-slate-400 mb-2">
                This project aims to revolutionize railway safety through autonomous monitoring and early defect detection.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} RAID Project. Built for safer railways.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
