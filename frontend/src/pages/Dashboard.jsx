import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Files,
  FileWarning,
  Ban,
  Activity,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Building2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import api from '../api/client';
import { getSummary } from '../api/analyticsApi';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, healthRes] = await Promise.all([
        getSummary().catch(() => ({ data: null })),
        api.get('/health').catch(() => ({ data: null })),
      ]);

      if (sumRes.data) {
        setSummary(sumRes.data?.data || sumRes.data);
      }
      if (healthRes.data?.success) {
        setSystemInfo(healthRes.data.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch standby:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: 'Total Scanned Files',
      value: summary?.totalScannedFiles ?? 0,
      change: 'Continuous inspection',
      icon: Files,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Sensitive Files Found',
      value: summary?.sensitiveFiles ?? 0,
      change: 'Classified & tracked',
      icon: FileWarning,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      label: 'Active Incidents',
      value: summary?.openIncidents ?? 0,
      change: `${summary?.highRiskIncidents ?? 0} high risk`,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
    {
      label: 'Simulated Policy Decisions',
      value: summary?.simulatedDecisions ?? 0,
      change: 'Safe evaluation mode',
      icon: Activity,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
    {
      label: 'Enforced Blocks',
      value: summary?.blockedActions ?? 0,
      change: 'Direct enforcement',
      icon: Ban,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      label: 'Registered Endpoints',
      value: summary?.totalEndpoints ?? 1,
      change: `${summary?.onlineEndpoints ?? 1} online`,
      icon: Laptop,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Central DLP Command Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Endpoint-first data loss prevention, continuous pattern detection, and policy simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/80 border border-cyan-800 text-cyan-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            Central Host Controller Online
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-xl bg-slate-900/80 border ${stat.borderColor} shadow-sm transition hover:border-slate-700`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">{stat.value}</span>
                <span className="text-xs text-slate-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-cyan-400" />
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Engine Health & Monitored Directory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engine Telemetry Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Engine Health & Runtime Telemetry
            </h3>
            <span className="text-xs text-slate-500 font-mono">REST /api/health</span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Core Service</span>
              <span className="font-mono text-cyan-300">{systemInfo?.service || 'intellidlp-backend'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Status</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {systemInfo?.status || 'HEALTHY'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Runtime Engine</span>
              <span className="font-mono text-slate-300">Java {systemInfo?.javaVersion || '21 / 25'} LTS</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Device Compliance Rate</span>
              <span className="font-mono text-emerald-400 font-bold">
                {summary?.compliancePercent != null ? `${Number(summary.compliancePercent).toFixed(1)}%` : '100%'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">AI Security Assistant</span>
              <span className="font-mono text-cyan-300">Ollama (llama3.2:latest) Local Copilot</span>
            </div>
          </div>
        </div>

        {/* Monitored Roots Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <Laptop className="h-4 w-4 text-cyan-400" />
              Approved Endpoint Monitored Directories
            </h3>
            <span className="text-xs text-cyan-400 font-mono">Java WatchService</span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="font-semibold text-white">finance-drop</span>
                <span className="text-emerald-400 text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                c:\IPS\data_loss_prevention\test-monitored-folders\finance-drop
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="font-semibold text-white">hr-drop</span>
                <span className="text-emerald-400 text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                c:\IPS\data_loss_prevention\test-monitored-folders\hr-drop
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
