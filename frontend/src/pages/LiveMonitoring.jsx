import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Activity,
  File,
  Usb,
  Shield,
  Heart,
  RefreshCw,
  X,
  Filter,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getEvents } from '../api/monitoringApi';

const CATEGORIES = ['ALL', 'FILE', 'USB', 'DLP', 'HEALTH'];
const SEVERITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const PAGE_SIZE = 20;

const SEVERITY_BORDER = {
  LOW: 'border-l-blue-400',
  MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-orange-400',
  CRITICAL: 'border-l-red-500',
};

const SEVERITY_BADGE = {
  LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const CAT_ICON = {
  FILE: File,
  USB: Usb,
  DLP: Shield,
  HEALTH: Heart,
};

function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LiveMonitoring() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [page, setPage] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    try {
      const params = { page, size: PAGE_SIZE };
      if (category !== 'ALL') params.category = category;
      if (severity !== 'ALL') params.severity = severity;
      const res = await getEvents(params);
      const data = res.data?.data ?? res.data;
      if (Array.isArray(data)) {
        setEvents(data);
        setTotal(data.length);
      } else if (data?.content) {
        setEvents(data.content);
        setTotal(data.totalElements ?? data.content.length);
      } else {
        setEvents([]);
        setTotal(0);
      }
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [category, severity, page]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(fetchEvents, 10000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, fetchEvents]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Category counts (from loaded events, approximate)
  const categoryCounts = events.reduce((acc, e) => {
    acc[e.eventCategory || e.category] = (acc[e.eventCategory || e.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-cyan-400" />
            Live Endpoint Events
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time event stream from monitored endpoints.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              autoRefresh
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Category Tabs */}
        <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(0); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                category === cat
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
              {cat !== 'ALL' && categoryCounts[cat] ? (
                <span className="bg-slate-700 text-slate-300 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                  {categoryCounts[cat]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Severity Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(0); }}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Severities' : s}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(category !== 'ALL' || severity !== 'ALL') && (
          <button
            onClick={() => { setCategory('ALL'); setSeverity('ALL'); setPage(0); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition border border-slate-700"
          >
            <X className="h-3.5 w-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 gap-3 rounded-xl bg-slate-900 border border-slate-800">
          <Activity className="h-10 w-10 text-slate-600" />
          <p className="text-slate-500 text-sm">No events found for the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => {
            const cat = ev.eventCategory || ev.category || 'FILE';
            const sev = ev.severity || 'LOW';
            const CatIcon = CAT_ICON[cat] || File;
            return (
              <div
                key={ev.id}
                className={`flex gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 border-l-4 ${SEVERITY_BORDER[sev] || 'border-l-slate-600'} hover:bg-slate-800/40 transition`}
              >
                {/* Category Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="p-2 rounded-lg bg-slate-800">
                    <CatIcon className="h-4 w-4 text-cyan-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_BADGE[sev] || ''}`}>
                      {sev}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                      {ev.eventType || cat}
                    </span>
                    {ev.isBlocked && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        BLOCKED
                      </span>
                    )}
                    {ev.isSimulated && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        SIMULATED
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-200 mb-1.5">{ev.description || '—'}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {ev.hostname && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                        {ev.hostname}
                      </span>
                    )}
                    {ev.employeeName && <span>{ev.employeeName}</span>}
                    {ev.departmentName && <span className="text-slate-500">/ {ev.departmentName}</span>}
                  </div>

                  {ev.filePath && (
                    <p className="mt-1.5 text-xs font-mono text-slate-500 truncate max-w-xl" title={ev.filePath}>
                      {ev.filePath}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-slate-500 whitespace-nowrap">
                  {timeAgo(ev.createdAt || ev.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
