import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  Activity,
  FileSearch,
  Database,
  AlertTriangle,
  Shield,
  Laptop,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Bot,
  Users,
  Settings,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/organization', label: 'Organization', icon: Building2 },
  { path: '/endpoints', label: 'Endpoints', icon: Laptop },
  { path: '/live-events', label: 'Live Events', icon: Activity },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/policies', label: 'DLP Policies', icon: Shield },
  { path: '/risk-analytics', label: 'Risk Analytics', icon: BarChart3 },
  { path: '/reports', label: 'Reports & Exports', icon: FileSpreadsheet },
  { path: '/ai-assistant', label: 'AI Security Assistant', icon: Bot },
  { path: '/file-scanner', label: 'File Scanner', icon: FileSearch },
  { path: '/data-inventory', label: 'Data Inventory', icon: Database },
  { path: '/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/users', label: 'User Management', icon: Users },
  { path: '/settings', label: 'System Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-900/60">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            Intelli<span className="text-cyan-400">DLP</span>
          </span>
          <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            SOC Defense v1.0
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Security Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mode Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Enforcement Mode</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SIMULATION
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Zero disruption. Actions safely audited.
        </p>
        <NavLink
          to="/client-agent"
          className="flex items-center justify-between text-[11px] text-cyan-400 hover:text-cyan-300 pt-1 border-t border-slate-800/80"
        >
          <span>Open Client Agent View</span>
          <ExternalLink className="h-3 w-3" />
        </NavLink>
      </div>
    </aside>
  );
}

