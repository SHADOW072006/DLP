import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Shield,
  Laptop,
  Building2
} from 'lucide-react';
import { exportReport } from '../api/analyticsApi';

const REPORT_TYPES = [
  {
    id: 'INCIDENTS',
    title: 'Security Incidents Audit',
    description: 'Full record of all detected policy violations, risk scores, affected file paths, and analyst resolution status.',
    icon: Shield,
    badge: 'Security Operations',
  },
  {
    id: 'DEPARTMENTS',
    title: 'Department Risk Posture',
    description: 'Summary of department-level device counts, incident density, and aggregate risk exposure metrics.',
    icon: Building2,
    badge: 'Compliance & Audit',
  },
  {
    id: 'ENDPOINTS',
    title: 'Endpoint Inventory & Health',
    description: 'List of registered hosts, OS versions, approval states, heartbeat timestamps, and compliance percentages.',
    icon: Laptop,
    badge: 'Asset Management',
  },
  {
    id: 'POLICIES',
    title: 'DLP Policy Configuration',
    description: 'Export of active detection rules, simulation vs enforcement states, target classifications, and assigned actions.',
    icon: FileText,
    badge: 'Policy Governance',
  },
];

export default function Reports() {
  const [selectedType, setSelectedType] = useState('INCIDENTS');
  const [dateRange, setDateRange] = useState({
    start: '2026-01-01',
    end: new Date().toISOString().split('T')[0],
  });
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleDownload = async () => {
    setGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await exportReport('CSV');
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `intellidlp_${selectedType.toLowerCase()}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSuccessMsg(`Successfully generated and downloaded ${selectedType} report.`);
    } catch (err) {
      console.error('Failed to export report', err);
      setErrorMsg('Failed to generate export file from server.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
          Security Compliance & Reports
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Export verified security audits, threat registers, and device inventory logs in CSV format for executive review.
        </p>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedType === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedType(rep.id)}
              className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/80 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-300'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {rep.badge}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-base mb-1">{rep.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{rep.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className={isSelected ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
                  {isSelected ? '✓ Selected for export' : 'Click to select'}
                </span>
                <span className="text-slate-400 font-mono">Format: CSV</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parameters & Export Action Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-400" />
          Export Scope & Filters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download {selectedType} Report (CSV)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
