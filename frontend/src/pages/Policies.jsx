import React, { useEffect, useState } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  toggleSimulationMode,
} from '../api/policyApi';

const ACTION_COLORS = {
  BLOCK: 'bg-red-500/10 text-red-400 border-red-500/20',
  WARN: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  REQUIRE_APPROVAL: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ALLOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const CLASS_LEVELS = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET'];
const ACTIONS = ['ALLOW', 'WARN', 'REQUIRE_APPROVAL', 'BLOCK'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const EMPTY_FORM = {
  name: '',
  description: '',
  targetClassification: 'CONFIDENTIAL',
  detectionCategory: '',
  action: 'WARN',
  severity: 'MEDIUM',
  simulationMode: true,
  isActive: true,
};

function Badge({ label, colorClass }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {label}
    </span>
  );
}

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data?: policy }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [enforceConfirm, setEnforceConfirm] = useState(null); // policy to enforce

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPolicies();
      setPolicies(res.data?.data ?? res.data ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: 'add' });
  };
  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      description: p.description || '',
      targetClassification: p.targetClassification || 'CONFIDENTIAL',
      detectionCategory: p.detectionCategory || '',
      action: p.action || 'WARN',
      severity: p.severity || 'MEDIUM',
      simulationMode: p.simulationMode ?? true,
      isActive: p.isActive ?? true,
    });
    setModal({ mode: 'edit', data: p });
  };

  const savePolicy = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await createPolicy(form);
      } else {
        await updatePolicy(modal.data.id, form);
      }
      setModal(null);
      fetchPolicies();
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deletePolicy(deleteTarget.id);
      setDeleteTarget(null);
      fetchPolicies();
    } catch (e) {
      alert('Delete failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleMode = async (p) => {
    // If currently SIMULATED, switching to ENFORCED — show confirmation
    if (p.simulationMode) {
      setEnforceConfirm(p);
      return;
    }
    // Switching to SIMULATED — do it directly
    try {
      await toggleSimulationMode(p.id);
      fetchPolicies();
    } catch (e) {
      alert('Toggle failed: ' + e.message);
    }
  };

  const confirmEnforce = async () => {
    try {
      await toggleSimulationMode(enforceConfirm.id);
      setEnforceConfirm(null);
      fetchPolicies();
    } catch (e) {
      alert('Toggle failed: ' + e.message);
    }
  };

  const handleToggleActive = async (p) => {
    try {
      await updatePolicy(p.id, { ...p, isActive: !p.isActive });
      fetchPolicies();
    } catch (e) {
      alert('Update failed: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyan-400" />
            DLP Policy Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Define rules, detection categories, and enforcement modes.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition"
        >
          <Plus className="h-4 w-4" /> Add Policy
        </button>
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
            <button onClick={fetchPolicies} className="text-xs text-cyan-400 hover:underline">Retry</button>
          </div>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Shield className="h-8 w-8 text-slate-600" />
            <p className="text-slate-500 text-sm">No policies defined yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  {['Name', 'Classification', 'Detection', 'Action', 'Severity', 'Sim Mode', 'Active', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-semibold text-white max-w-[160px] truncate" title={p.name}>{p.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-300">{p.targetClassification || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate" title={p.detectionCategory}>{p.detectionCategory || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge label={p.action || '—'} colorClass={ACTION_COLORS[p.action] || 'bg-slate-700 text-slate-300 border-slate-600'} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={p.severity || '—'} colorClass={SEVERITY_COLORS[p.severity] || 'bg-slate-700 text-slate-300 border-slate-600'} />
                    </td>
                    {/* Simulation Mode Toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleMode(p)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                          p.simulationMode
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {p.simulationMode ? 'SIMULATED' : 'ENFORCED'}
                      </button>
                    </td>
                    {/* Active Toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          p.isActive ? 'bg-cyan-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-lg">
                {modal.mode === 'add' ? 'Create Policy' : 'Edit Policy'}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Policy Name *</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. PAN Card Detection Policy"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Classification Level</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    value={form.targetClassification}
                    onChange={(e) => setForm({ ...form, targetClassification: e.target.value })}
                  >
                    {CLASS_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Detection Category</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    value={form.detectionCategory}
                    onChange={(e) => setForm({ ...form, detectionCategory: e.target.value })}
                    placeholder="e.g. PAN_CARD"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Action</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    value={form.action}
                    onChange={(e) => setForm({ ...form, action: e.target.value })}
                  >
                    {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Severity</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  >
                    {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-cyan-500"
                    checked={form.simulationMode}
                    onChange={(e) => setForm({ ...form, simulationMode: e.target.checked })}
                  />
                  <span className="text-sm text-slate-300">Simulation Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-cyan-500"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={savePolicy}
                disabled={saving || !form.name}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : modal.mode === 'add' ? 'Create Policy' : 'Save Changes'}
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition border border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-800/40 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="h-5 w-5 text-red-400" />
              <h3 className="font-semibold text-white">Delete Policy</h3>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Delete <span className="text-white font-semibold">{deleteTarget.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition border border-slate-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enforce Confirmation */}
      {enforceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-orange-800/40 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <h3 className="font-semibold text-white">Switch to Enforced Mode?</h3>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Switching <span className="text-white font-semibold">{enforceConfirm.name}</span> from Simulation to Enforced mode will cause real blocking actions.
              This may disrupt user workflows.
            </p>
            <div className="flex gap-2">
              <button onClick={confirmEnforce}
                className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition">
                Switch to ENFORCED
              </button>
              <button onClick={() => setEnforceConfirm(null)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition border border-slate-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
