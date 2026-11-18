import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Building2,
  RefreshCw,
  AlertTriangle,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getSummary, getDepartmentStats, getIncidentTrends } from '../api/analyticsApi';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

export default function RiskAnalytics() {
  const [summary, setSummary] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, deptRes, trendRes] = await Promise.all([
        getSummary().catch(() => ({ data: {} })),
        getDepartmentStats().catch(() => ({ data: [] })),
        getIncidentTrends(30).catch(() => ({ data: [] })),
      ]);

      setSummary(sumRes.data?.data || sumRes.data || {});
      setDeptStats(deptRes.data?.data || deptRes.data || []);
      setTrends(trendRes.data?.data || trendRes.data || []);
    } catch (err) {
      console.error('Failed to load risk analytics', err);
      setError('Unable to load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const severityData = [
    { name: 'Critical (High Risk)', value: summary?.highRiskIncidents || 0 },
    { name: 'Open Incidents', value: summary?.openIncidents || 0 },
    { name: 'Simulated Blocks', value: summary?.simulatedDecisions || 0 },
    { name: 'Enforced Blocks', value: summary?.blockedActions || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-cyan-400" />
            Risk & Threat Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time organizational risk posture, departmental threat indices, and incident trends.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase font-mono">Org Compliance</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {summary?.compliancePercent != null ? `${Number(summary.compliancePercent).toFixed(1)}%` : '100%'}
          </span>
          <span className="text-[11px] text-slate-500">Based on endpoint health</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase font-mono">Open Threats</span>
          <span className="text-2xl font-bold text-red-400 font-mono mt-1 block">
            {summary?.openIncidents ?? 0}
          </span>
          <span className="text-[11px] text-slate-500">
            {summary?.highRiskIncidents ?? 0} high severity
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase font-mono">Sensitive Files</span>
          <span className="text-2xl font-bold text-yellow-400 font-mono mt-1 block">
            {summary?.sensitiveFiles ?? 0}
          </span>
          <span className="text-[11px] text-slate-500">Out of {summary?.totalScannedFiles ?? 0} scanned</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block uppercase font-mono">Simulated Decisions</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono mt-1 block">
            {summary?.simulatedDecisions ?? 0}
          </span>
          <span className="text-[11px] text-slate-500">Zero business disruption</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Trends Over Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            30-Day Incident Frequency Trend
          </h2>
          <div className="h-64 w-full">
            {trends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No historical incidents recorded in the current timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department Security & Risk Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-400" />
            Departmental Risk Index
          </h2>
          <div className="h-64 w-full">
            {deptStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No departmental metrics available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="departmentName" stroke="#94a3b8" fontSize={10} interval={0} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="riskScore" fill="#f97316" radius={[4, 4, 0, 0]} name="Risk Score (0-100)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Department Risk Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-800/40">
          <h3 className="text-sm font-semibold text-white">Department Posture Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-center">Endpoints Assigned</th>
                <th className="px-4 py-3 text-center">Incidents Recorded</th>
                <th className="px-4 py-3">Risk Exposure Meter</th>
                <th className="px-4 py-3 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {deptStats.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">
                    No departmental data available.
                  </td>
                </tr>
              ) : (
                deptStats.map((d) => (
                  <tr key={d.departmentId || d.departmentName} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-medium text-white">{d.departmentName}</td>
                    <td className="px-4 py-3 text-center font-mono">{d.deviceCount || 0}</td>
                    <td className="px-4 py-3 text-center font-mono">{d.incidentCount || 0}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            (d.riskScore || 0) >= 60
                              ? 'bg-red-500'
                              : (d.riskScore || 0) >= 30
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, d.riskScore || 0)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span
                        className={
                          (d.riskScore || 0) >= 60
                            ? 'text-red-400'
                            : (d.riskScore || 0) >= 30
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }
                      >
                        {d.riskScore || 0} / 100
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
