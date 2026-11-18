import React, { useEffect, useState } from 'react';
import {
  Building2,
  Edit2,
  Plus,
  Trash2,
  X,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getOrganization,
  updateOrganization,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../api/organizationApi';

function RiskBadge({ score }) {
  if (score == null) return <span className="text-slate-500 text-xs">—</span>;
  if (score < 30)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        {score} LOW
      </span>
    );
  if (score <= 60)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        {score} MED
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
      {score} HIGH
    </span>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />;
}

export default function Organization() {
  const [org, setOrg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Org edit
  const [editingOrg, setEditingOrg] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: '', code: '', contactEmail: '' });
  const [orgSaving, setOrgSaving] = useState(false);

  // Department modal (add/edit)
  const [deptModal, setDeptModal] = useState(null); // null | { mode: 'add'|'edit', data?: dept }
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [deptSaving, setDeptSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgRes, deptRes] = await Promise.all([getOrganization(), getDepartments()]);
      setOrg(orgRes.data?.data ?? orgRes.data);
      setDepartments(deptRes.data?.data ?? deptRes.data ?? []);
    } catch (e) {
      setError(e.message || 'Failed to load organization data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const startEditOrg = () => {
    setOrgForm({
      name: org?.name || '',
      code: org?.code || '',
      contactEmail: org?.contactEmail || '',
    });
    setEditingOrg(true);
  };

  const saveOrg = async () => {
    setOrgSaving(true);
    try {
      const res = await updateOrganization(orgForm);
      setOrg(res.data?.data ?? res.data);
      setEditingOrg(false);
    } catch (e) {
      alert('Failed to save organization: ' + (e.response?.data?.message || e.message));
    } finally {
      setOrgSaving(false);
    }
  };

  const openAddDept = () => {
    setDeptForm({ name: '', code: '' });
    setDeptModal({ mode: 'add' });
  };

  const openEditDept = (dept) => {
    setDeptForm({ name: dept.name || '', code: dept.code || '' });
    setDeptModal({ mode: 'edit', data: dept });
  };

  const saveDept = async () => {
    setDeptSaving(true);
    try {
      if (deptModal.mode === 'add') {
        await createDepartment(deptForm);
      } else {
        await updateDepartment(deptModal.data.id, deptForm);
      }
      setDeptModal(null);
      await fetchAll();
    } catch (e) {
      alert('Failed to save department: ' + (e.response?.data?.message || e.message));
    } finally {
      setDeptSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteDepartment(deleteTarget.id);
      setDeleteTarget(null);
      await fetchAll();
    } catch (e) {
      alert('Failed to delete: ' + (e.response?.data?.message || e.message));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-slate-300">{error}</p>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-cyan-400" />
            Organization Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your organization profile and department structure.
          </p>
        </div>
      </div>

      {/* Org Profile Card */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cyan-400" />
            Organization Profile
          </h2>
          {!editingOrg && (
            <button
              onClick={startEditOrg}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
        </div>

        {editingOrg ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Organization Name</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Organization Code</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  value={orgForm.code}
                  onChange={(e) => setOrgForm({ ...orgForm, code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Email</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  value={orgForm.contactEmail}
                  onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveOrg}
                disabled={orgSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {orgSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingOrg(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition border border-slate-700"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Name</span>
              <p className="mt-1 text-sm font-semibold text-white">{org?.name || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Code</span>
              <p className="mt-1 text-sm font-mono text-cyan-300">{org?.code || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Contact Email</span>
              <p className="mt-1 text-sm text-slate-300">{org?.contactEmail || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Departments Table */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">Departments</h2>
          <button
            onClick={openAddDept}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add Department
          </button>
        </div>

        {departments.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No departments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Code</th>
                  <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Devices</th>
                  <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Score</th>
                  <th className="pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 pr-4 font-medium text-white">{dept.name}</td>
                    <td className="py-3 pr-4 font-mono text-cyan-300 text-xs">{dept.code}</td>
                    <td className="py-3 pr-4 text-slate-300">{dept.deviceCount ?? dept.devices ?? 0}</td>
                    <td className="py-3 pr-4">
                      <RiskBadge score={dept.riskScore} />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDept(dept)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(dept)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition"
                          title="Delete"
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

      {/* Department Add/Edit Modal */}
      {deptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">
                {deptModal.mode === 'add' ? 'Add Department' : 'Edit Department'}
              </h3>
              <button onClick={() => setDeptModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Department Name *</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Finance"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Department Code *</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. FIN"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={saveDept}
                disabled={deptSaving || !deptForm.name || !deptForm.code}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {deptSaving ? 'Saving…' : deptModal.mode === 'add' ? 'Create' : 'Save'}
              </button>
              <button
                onClick={() => setDeptModal(null)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition border border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-800/40 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="h-5 w-5 text-red-400" />
              <h3 className="font-semibold text-white">Delete Department</h3>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Are you sure you want to delete{' '}
              <span className="text-white font-semibold">{deleteTarget.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
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
