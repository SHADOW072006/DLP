import React, { useEffect, useState, useCallback } from 'react';
import {
  Laptop,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  PauseCircle,
  ChevronRight,
  X,
  Terminal,
  Building2,
  AlertCircle,
} from 'lucide-react';
import {
  getEndpoints,
  approveEndpoint,
  rejectEndpoint,
  suspendEndpoint,
  issueCommand,
  assignDepartment,
} from '../api/endpointApi';
import { getDepartments } from '../api/organizationApi';

const STATUS_COLORS = {
  ONLINE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  OFFLINE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const APPROVAL_COLORS = {
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  SUSPENDED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const TABS = ['ALL', 'PENDING', 'ONLINE', 'OFFLINE'];
const COMMANDS = ['TRIGGER_SCAN', 'SYNC_POLICIES', 'HEALTH_CHECK'];

function Badge({ label, colorClass }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {label}
    </span>
  );
}

function ComplianceBar({ score }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score ?? 0}%` }} />
      </div>
      <span className="text-xs text-slate-300 font-mono">{score ?? '—'}</span>
    </div>
  );
}

function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Endpoints() {
  const [endpoints, setEndpoints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [drawer, setDrawer] = useState(null);
  const [commandTarget, setCommandTarget] = useState(null);
  const [commandValue, setCommandValue] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (activeTab === 'PENDING') params.approvalStatus = 'PENDING';
      else if (activeTab === 'ONLINE') params.status = 'ONLINE';
      else if (activeTab === 'OFFLINE') params.status = 'OFFLINE';

      const [epRes, deptRes] = await Promise.all([
        getEndpoints(params),
        getDepartments(),
      ]);
      setEndpoints(epRes.data?.data ?? epRes.data?.content ?? epRes.data ?? []);
      setDepartments(deptRes.data?.data ?? deptRes.data ?? []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const timer = setInterval(fetchData, 15000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleApprove = async (id) => {
    try { await approveEndpoint(id); fetchData(); } catch (e) { alert(e.message); }
  };
  const handleReject = async (id) => {
    try { await rejectEndpoint(id); fetchData(); } catch (e) { alert(e.message); }
  };
  const handleSuspend = async (id) => {
    try { await suspendEndpoint(id); fetchData(); } catch (e) { alert(e.message); }
  };
  const handleAssignDept = async (id, deptId) => {
    try { await assignDepartment(id, deptId); fetchData(); } catch (e) { alert(e.message); }
  };
  const handleIssueCommand = async () => {
    if (!commandValue) return;
    setCommandLoading(true);
    try {
      await issueCommand(commandTarget.id, commandValue);
      setCommandTarget(null);
      setCommandValue('');
      fetchData();
    } catch (e) {
      alert(e.message);
    } finally {
      setCommandLoading(false);
    }
  };

  const allEndpoints = endpoints;
  const stats = {
    total: allEndpoints.length,
    online: allEndpoints.filter((e) => e.status === 'ONLINE').length,
    offline: allEndpoints.filter((e) => e.status === 'OFFLINE').length,
    pending: allEndpoints.filter((e) => e.approvalStatus === 'PENDING').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Laptop className="h-6 w-6 text-cyan-400" />
            Endpoint Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Monitor, approve, and manage registered endpoints.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Laptop, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Online', value: stats.online, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Offline', value: stats.offline, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="text-xl font-bold text-white font-mono">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === tab
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'ALL' ? 'All Devices' : tab === 'PENDING' ? 'Pending Approval' : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-slate-400 text-sm">{error}</p>
            <button onClick={fetchData} className="text-xs text-cyan-400 hover:underline">Retry</button>
          </div>
        ) : endpoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Laptop className="h-8 w-8 text-slate-600" />
            <p className="text-slate-500 text-sm">No endpoints found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  {['Hostname', 'IP', 'OS', 'Employee', 'Department', 'Status', 'Approval', 'Compliance', 'Last Seen', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {endpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-slate-800/30 transition group">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDrawer(ep)}
                        className="font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:underline"
                      >
                        {ep.hostname}
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{ep.ipAddress || ep.ip || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{ep.operatingSystem || ep.os || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{ep.employeeName || ep.employee?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{ep.departmentName || ep.department?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge label={ep.status || 'UNKNOWN'} colorClass={STATUS_COLORS[ep.status] || 'bg-slate-700 text-slate-300 border-slate-600'} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={ep.approvalStatus || 'UNKNOWN'} colorClass={APPROVAL_COLORS[ep.approvalStatus] || 'bg-slate-700 text-slate-300 border-slate-600'} />
                    </td>
                    <td className="px-4 py-3">
                      <ComplianceBar score={ep.complianceScore} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{timeAgo(ep.lastSeen || ep.lastHeartbeat)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ep.approvalStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(ep.id)}
                              className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs font-medium transition border border-emerald-500/20"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(ep.id)}
                              className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-medium transition border border-red-500/20"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {ep.approvalStatus === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => handleSuspend(ep.id)}
                              className="px-2 py-1 rounded bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 text-xs font-medium transition border border-yellow-500/20"
                            >
                              <PauseCircle className="h-3 w-3 inline mr-0.5" />
                              Suspend
                            </button>
                            <button
                              onClick={() => { setCommandTarget(ep); setCommandValue(''); }}
                              className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition border border-slate-600"
                            >
                              <Terminal className="h-3 w-3 inline mr-0.5" />
                              Command
                            </button>
                          </>
                        )}
                        <select
                          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                          value={ep.departmentId || ''}
                          onChange={(e) => handleAssignDept(ep.id, e.target.value)}
                        >
                          <option value="">Assign Dept…</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawer(null)} />
          <div className="relative w-full max-w-lg h-full bg-slate-900 border-l border-slate-700 overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Laptop className="h-5 w-5 text-cyan-400" />
                {drawer.hostname}
              </h2>
              <button onClick={() => setDrawer(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 flex-1">
              {[
                ['Device ID', drawer.id],
                ['IP Address', drawer.ipAddress || drawer.ip],
                ['Operating System', drawer.operatingSystem || drawer.os],
                ['Employee', drawer.employeeName],
                ['Department', drawer.departmentName],
                ['Status', drawer.status],
                ['Approval', drawer.approvalStatus],
                ['Agent Version', drawer.agentVersion],
                ['Last Seen', drawer.lastSeen || drawer.lastHeartbeat],
                ['Last Sync', drawer.lastSync],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm py-1.5 border-b border-slate-800/50">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-200 font-mono text-xs max-w-xs text-right truncate">{val || '—'}</span>
                </div>
              ))}

              {/* Compliance Gauge */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Compliance Score</p>
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20">
                    <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={drawer.complianceScore >= 80 ? '#10b981' : drawer.complianceScore >= 50 ? '#eab308' : '#ef4444'}
                        strokeWidth="3"
                        strokeDasharray={`${drawer.complianceScore ?? 0} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                      {drawer.complianceScore ?? '—'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Endpoint compliance score based on policy adherence and health metrics.</p>
                </div>
              </div>

              {/* Monitored Directories */}
              {drawer.monitoredDirectories?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Monitored Directories</p>
                  <div className="space-y-1">
                    {drawer.monitoredDirectories.map((dir, i) => (
                      <div key={i} className="px-3 py-2 rounded bg-slate-950/60 border border-slate-800 font-mono text-xs text-slate-300 truncate">
                        {dir}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Issue Command Modal */}
      {commandTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" /> Issue Command
              </h3>
              <button onClick={() => setCommandTarget(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">Target: <span className="text-cyan-300 font-mono">{commandTarget.hostname}</span></p>
            <select
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 mb-4"
              value={commandValue}
              onChange={(e) => setCommandValue(e.target.value)}
            >
              <option value="">Select command…</option>
              {COMMANDS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleIssueCommand}
                disabled={!commandValue || commandLoading}
                className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition disabled:opacity-50"
              >
                {commandLoading ? 'Sending…' : 'Send Command'}
              </button>
              <button
                onClick={() => setCommandTarget(null)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition border border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
