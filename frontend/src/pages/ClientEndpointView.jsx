import React, { useEffect, useState } from 'react';
import {
  Laptop,
  Shield,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  FolderLock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Terminal,
  Send
} from 'lucide-react';
import { getEndpoints } from '../api/endpointApi';
import { getLatestEvents } from '../api/monitoringApi';

export default function ClientEndpointView() {
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [epRes, evRes] = await Promise.all([
        getEndpoints().catch(() => ({ data: [] })),
        getLatestEvents(10).catch(() => ({ data: [] })),
      ]);

      const epList = epRes.data?.data || epRes.data || [];
      setEndpoints(epList);
      if (epList.length > 0 && !selectedEndpoint) {
        setSelectedEndpoint(epList[0]);
      } else if (selectedEndpoint) {
        const updated = epList.find((e) => e.id === selectedEndpoint.id);
        if (updated) setSelectedEndpoint(updated);
      }

      const evList = evRes.data?.data || evRes.data || [];
      setEvents(evList);
    } catch (err) {
      console.error('Failed to load endpoint data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setLastSync(new Date().toLocaleTimeString());
      setSyncing(false);
      fetchData();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between font-sans">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Top Branding Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Laptop className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">IntelliDLP Endpoint Client</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PROTECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Centralized Host Agent v1.4.0 • Zero-Trust Real-Time File Guard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin text-cyan-400' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Policies'}
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded-xl shadow-md shadow-cyan-500/20 transition"
            >
              Host Dashboard →
            </a>
          </div>
        </div>

        {/* Device Switcher / Overview */}
        {endpoints.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 text-xs overflow-x-auto">
            <span className="text-slate-400 px-2 font-mono">Select Device:</span>
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedEndpoint?.id === ep.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ep.hostname} ({ep.employeeName || 'Assigned'})
              </button>
            ))}
          </div>
        )}

        {/* Main Grid: Device Telemetry & Monitored Events */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1 & 2: Health & Monitored Folders */}
          <div className="md:col-span-2 space-y-6">
            {/* Status & Compliance Meter */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                Workstation Health & Compliance
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Hostname</span>
                  <span className="text-white font-mono font-medium">{selectedEndpoint?.hostname || 'LOCAL-STATION'}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Assigned Employee</span>
                  <span className="text-white font-medium">{selectedEndpoint?.employeeName || 'Security Analyst'}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Department</span>
                  <span className="text-cyan-400 font-medium">{selectedEndpoint?.departmentName || 'Security Operations'}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Compliance Score</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    {selectedEndpoint?.complianceScore ?? 100}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">IP Address</span>
                  <span className="text-slate-300 font-mono">{selectedEndpoint?.ipAddress || '192.168.1.100'}</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Operating System</span>
                  <span className="text-slate-300">{selectedEndpoint?.osVersion || 'Windows 11 Pro'}</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Last Heartbeat</span>
                  <span className="text-slate-300 font-mono">{lastSync}</span>
                </div>
              </div>
            </div>

            {/* Approved Monitored Directories */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <FolderLock className="h-4 w-4 text-yellow-400" />
                Active Monitored Watch Roots
              </h2>
              <p className="text-xs text-slate-400">
                Transparent kernel file hooks observe creation and modification in these approved boundaries:
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>C:\IPS\data_loss_prevention\test-monitored-folders\finance-drop</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-sans px-2 py-0.5 rounded bg-emerald-500/10">Active</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>C:\IPS\data_loss_prevention\test-monitored-folders\hr-drop</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-sans px-2 py-0.5 rounded bg-emerald-500/10">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Live Local Events Feed */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Recent Agent Activity
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Live</span>
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {events.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No endpoint security violations detected recently.
                  </p>
                ) : (
                  events.slice(0, 6).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{ev.eventType || 'FILE_AUDIT'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate" title={ev.description || ev.filePath}>
                        {ev.description || ev.filePath}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px]">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {ev.eventCategory}
                        </span>
                        <span className={ev.isSimulated ? 'text-emerald-400' : 'text-red-400'}>
                          {ev.isSimulated ? 'SIMULATED' : 'BLOCKED'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 mt-8">
        IntelliDLP Zero-Trust Autonomous Endpoint Security • Centralized Enterprise Controller
      </footer>
    </div>
  );
}
