import React, { useEffect, useState } from 'react';
import { Bell, Wifi, RefreshCw, LogOut, Shield } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState({ status: 'UP', service: 'intellidlp-backend' });
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/health');
      if (res.data?.success) {
        setHealth(res.data.data);
      }
    } catch {
      setHealth({ status: 'STANDBY', service: 'intellidlp-backend' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const primaryRole = user?.roles?.[0]?.replace('ROLE_', '') || 'ANALYST';

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between z-10">
      {/* Search / Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">SYSTEM:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            IntelliDLP Enterprise
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 font-medium">SOC Central Management</span>
        </div>
      </div>

      {/* Right Action Icons & Status */}
      <div className="flex items-center gap-4">
        {/* API Health Pill */}
        <button
          onClick={checkHealth}
          title="Click to recheck API health"
          className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 transition"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              health.status === 'UP' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 font-mono">Backend: {health.status}</span>
          <RefreshCw className={`h-3 w-3 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Live Watcher Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-800/80 border border-slate-700/80 text-slate-300">
          <Wifi className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono">WatchService: ACTIVE</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-slate-900" />
        </button>

        {/* Authenticated User Profile Badge & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600/30 to-blue-500/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs uppercase font-mono">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-slate-200 leading-tight">
              {user?.fullName || 'SOC Operator'}
            </span>
            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 mt-0.5">
              {primaryRole}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign out of session"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
