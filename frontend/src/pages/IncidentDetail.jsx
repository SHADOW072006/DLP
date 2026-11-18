import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  FileText,
  User,
  Laptop,
  AlertTriangle,
  Clock,
  Send,
  Bot,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers,
  FileCheck
} from 'lucide-react';
import { getIncidentById, updateIncidentStatus, addIncidentNote } from '../api/incidentApi';

const SEVERITY_BADGES = {
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const STATUS_OPTIONS = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'];

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusVal, setStatusVal] = useState('OPEN');
  const [savingStatus, setSavingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIncidentById(id);
      const data = res.data?.data || res.data;
      setIncident(data);
      if (data?.status) {
        setStatusVal(data.status);
      }
    } catch (err) {
      console.error('Failed to load incident detail', err);
      setError('Unable to load incident details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    setSavingStatus(true);
    try {
      await updateIncidentStatus(id, { status: statusVal });
      fetchDetail();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Could not update status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      await addIncidentNote(id, { noteText: newNote.trim() });
      setNewNote('');
      fetchDetail();
    } catch (err) {
      console.error('Failed to add note', err);
      alert('Could not add note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Activity className="h-8 w-8 animate-spin mx-auto text-cyan-500 mb-3" />
        Loading incident dossier...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/incidents')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Incidents
        </button>
        <div className="p-6 bg-red-950/30 border border-red-500/30 rounded-xl text-red-300">
          {error || 'Incident not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/incidents')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">{incident.incidentCode}</h1>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                  SEVERITY_BADGES[incident.severity] || 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {incident.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {incident.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Detected on {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/ai-assistant?incidentId=${incident.id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition"
        >
          <Bot className="h-4 w-4" />
          AI Incident Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Scoring & Threat Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              Risk Assessment & Threat Scoring
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-400 uppercase font-mono">Risk Score</span>
                <span
                  className={`text-4xl font-extrabold mt-1 font-mono ${
                    incident.riskScore >= 70
                      ? 'text-red-400'
                      : incident.riskScore >= 40
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {incident.riskScore || 0}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">Scale: 0 to 100</span>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 sm:col-span-2">
                <span className="text-xs text-slate-400 uppercase font-mono block mb-2">Risk Breakdown</span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {incident.riskBreakdown || 'Composite multi-factor risk computed based on sensitive pattern count, destination boundary, and historical violation frequency.'}
                </p>
              </div>
            </div>
          </div>

          {/* File Metadata & Evidence */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              File & Context Evidence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">File Name</span>
                <span className="text-white font-medium font-mono text-sm">{incident.fileName || 'document.pdf'}</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">File Size</span>
                <span className="text-white font-medium">
                  {incident.fileSizeBytes ? `${(incident.fileSizeBytes / 1024).toFixed(1)} KB` : 'Unknown'}
                </span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 sm:col-span-2">
                <span className="text-slate-400 block mb-1">Full Monitored Path</span>
                <span className="text-slate-300 font-mono break-all">{incident.filePath || 'C:\\monitored\\...'}</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Detected Classification</span>
                <span className="text-yellow-400 font-semibold">{incident.detectionCategory || 'CONFIDENTIAL'}</span>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Enforcement Applied</span>
                <span className="text-emerald-400 font-semibold">
                  {incident.isSimulated ? 'SIMULATED (Audited Only)' : incident.policyAction || 'ENFORCED'}
                </span>
              </div>
            </div>
          </div>

          {/* Analyst Notes Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-400" />
              Investigation Timeline & Analyst Notes
            </h2>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows="3"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add formal analyst findings, mitigation steps, or remediation notes..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote || !newNote.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                >
                  <Send className="h-3 w-3" />
                  {submittingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Existing notes */}
            <div className="space-y-3 mt-4 border-t border-slate-800 pt-4">
              {incident.notes && incident.notes.length > 0 ? (
                incident.notes.map((note) => (
                  <div key={note.id} className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-slate-300">
                        {note.authorUsername || 'Security Analyst'}
                      </span>
                      <span>{note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <p className="text-slate-200">{note.noteText}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No investigation notes logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="space-y-6">
          {/* Status & Triage Control */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Triage & Status</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Incident Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={savingStatus || statusVal === incident.status}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition"
              >
                {savingStatus ? 'Updating...' : 'Save Status Change'}
              </button>
            </div>
          </div>

          {/* Endpoint Dossier */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Laptop className="h-4 w-4 text-cyan-400" />
              Device Context
            </h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Hostname</span>
                <span className="text-white font-medium">{incident.endpointHostname || 'Local Host'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Employee</span>
                <span className="text-white font-medium">{incident.employeeName || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Department</span>
                <span className="text-white font-medium">{incident.departmentName || 'General'}</span>
              </div>
            </div>
          </div>

          {/* Policy Matched */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              Policy Triggered
            </h3>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-200">
                {incident.policyName || 'Default Restricted Data Exfiltration Rule'}
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Action:</span>
                <span className="text-yellow-400 font-mono font-bold">
                  {incident.policyAction || 'WARN'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Simulation:</span>
                <span className={incident.isSimulated ? 'text-emerald-400' : 'text-red-400'}>
                  {incident.isSimulated ? 'Active (Audit Only)' : 'Enforced'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
