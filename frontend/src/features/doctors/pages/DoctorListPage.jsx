import { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../../../api/admin.api';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(first, last) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

const SPEC_PALETTE = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
];

function specColor(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return SPEC_PALETTE[h % SPEC_PALETTE.length];
}

// ── Add/Edit Doctor Modal ─────────────────────────────────────────────────────
function DoctorModal({ doctor, departments, staffUsers, onClose, onSaved }) {
  const isEdit = !!doctor;
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    userId:          doctor?.userId?._id ?? '',
    departmentId:    doctor?.departmentId?._id ?? '',
    specializations: (doctor?.specializations ?? []).join(', '),
    qualifications:  (doctor?.qualifications ?? []).join(', '),
    experienceYears: doctor?.experienceYears ?? '',
    consultationFee: doctor?.consultationFee ?? '',
    bio:             doctor?.bio ?? '',
    isActive:        doctor?.isActive ?? true,
  });

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setErrors(p => ({ ...p, [name]: undefined }));
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const errs = {};
    if (!isEdit && !form.userId) errs.userId = 'Select a doctor user account';
    if (form.consultationFee !== '' && Number(form.consultationFee) < 0) errs.consultationFee = 'Cannot be negative';
    if (form.experienceYears !== '' && Number(form.experienceYears) < 0) errs.experienceYears = 'Cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        departmentId:    form.departmentId || null,
        specializations: form.specializations.split(',').map(s => s.trim()).filter(Boolean),
        qualifications:  form.qualifications.split(',').map(s => s.trim()).filter(Boolean),
        experienceYears: form.experienceYears !== '' ? Number(form.experienceYears) : undefined,
        consultationFee: form.consultationFee !== '' ? Number(form.consultationFee) : undefined,
        bio:             form.bio || undefined,
        isActive:        form.isActive,
      };
      if (!isEdit) payload.userId = form.userId;

      if (isEdit) {
        await adminApi.updateDoctor(doctor._id, payload);
        toast.success('Doctor profile updated');
      } else {
        await adminApi.createDoctor(payload);
        toast.success('Doctor profile created');
      }
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Doctor Profile' : 'Add Doctor Profile'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{isEdit ? `Dr. ${doctor.userId?.firstName} ${doctor.userId?.lastName}` : 'Link a staff user to a doctor profile'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl">×</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!isEdit && (
            <div>
              <label className="label">Staff User Account *</label>
              <select name="userId" value={form.userId} onChange={onChange} className={`input ${errors.userId ? 'border-red-400' : ''}`}>
                <option value="">— Select a user with Doctor role —</option>
                {staffUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
              {errors.userId && <p className="text-xs text-red-500 mt-1">{errors.userId}</p>}
              <p className="text-xs text-gray-400 mt-1">Only users with the Doctor role appear here. Invite a new user first if needed.</p>
            </div>
          )}

          <div>
            <label className="label">Department</label>
            <select name="departmentId" value={form.departmentId} onChange={onChange} className="input">
              <option value="">— No Department —</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Specializations <span className="text-gray-400 font-normal text-xs">(comma-separated)</span></label>
            <input name="specializations" value={form.specializations} onChange={onChange} className="input" placeholder="Cardiology, Internal Medicine…" />
          </div>

          <div>
            <label className="label">Qualifications <span className="text-gray-400 font-normal text-xs">(comma-separated)</span></label>
            <input name="qualifications" value={form.qualifications} onChange={onChange} className="input" placeholder="MBBS, MD, DM Cardiology…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Experience (years)</label>
              <input type="number" name="experienceYears" value={form.experienceYears} onChange={onChange} className={`input ${errors.experienceYears ? 'border-red-400' : ''}`} min={0} placeholder="10" />
              {errors.experienceYears && <p className="text-xs text-red-500 mt-1">{errors.experienceYears}</p>}
            </div>
            <div>
              <label className="label">Consultation Fee (₹)</label>
              <input type="number" name="consultationFee" value={form.consultationFee} onChange={onChange} className={`input ${errors.consultationFee ? 'border-red-400' : ''}`} min={0} placeholder="500" />
              {errors.consultationFee && <p className="text-xs text-red-500 mt-1">{errors.consultationFee}</p>}
            </div>
          </div>

          <div>
            <label className="label">Bio / Notes</label>
            <textarea name="bio" value={form.bio} onChange={onChange} rows={3} className="input resize-none" placeholder="Professional biography or clinical focus…" maxLength={1000} />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/1000</p>
          </div>

          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} className="sr-only" />
                <div className={`w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {form.isActive ? 'Active — visible in scheduling' : 'Inactive — hidden from scheduling'}
              </span>
            </label>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary px-8 min-w-[140px]">
            {saving
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
              : isEdit ? 'Save Changes' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Side Panel ─────────────────────────────────────────────────────────
function DoctorDetailPanel({ doctor, onClose, onEdit }) {
  if (!doctor) return null;
  const user = doctor.userId || {};
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="flex items-start justify-between mb-4">
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={() => { onClose(); onEdit(doctor); }} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 font-medium transition-colors">Edit Profile</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {initials(user.firstName, user.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-bold">Dr. {user.firstName} {user.lastName}</h2>
              <p className="text-primary-200 text-sm mt-0.5">{doctor.departmentId?.name || 'No department'}</p>
              <span className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${doctor.isActive ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
                {doctor.isActive ? '● Active' : '○ Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact</h3>
            <div className="space-y-2">
              {[['Email', user.email], ['Phone', user.phone || '—']].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{v}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Professional</h3>
            <div className="space-y-2">
              {[
                ['Experience', doctor.experienceYears > 0 ? `${doctor.experienceYears} years` : '—'],
                ['Consultation Fee', doctor.consultationFee > 0 ? `₹${doctor.consultationFee.toLocaleString()}` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {doctor.specializations?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.specializations.map((s, i) => (
                  <span key={i} className={`text-xs px-3 py-1 rounded-full font-medium ${specColor(s)}`}>{s}</span>
                ))}
              </div>
            </section>
          )}

          {doctor.qualifications?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Qualifications</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.qualifications.map((q, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">{q}</span>
                ))}
              </div>
            </section>
          )}

          {doctor.bio && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Bio</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{doctor.bio}</p>
            </section>
          )}

          <section className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-1 text-xs text-gray-400">
              <div>Created: {new Date(doctor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div>Updated: {new Date(doctor.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Doctor Table Row ──────────────────────────────────────────────────────────
function DoctorRow({ doctor, onEdit, onToggle, onView }) {
  const user = doctor.userId || {};
  const dept = doctor.departmentId;
  const active = doctor.isActive;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group" onClick={() => onView(doctor)}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm ${active ? 'bg-gradient-to-br from-primary-400 to-primary-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
            {initials(user.firstName, user.lastName)}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">Dr. {user.firstName} {user.lastName}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 hidden md:table-cell">
        {dept ? <span className="text-sm text-gray-700 dark:text-gray-300">{dept.name}</span> : <span className="text-xs text-gray-400 italic">No department</span>}
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {doctor.specializations?.length > 0
            ? doctor.specializations.slice(0, 3).map((s, i) => (
                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${specColor(s)}`}>{s}</span>
              ))
            : <span className="text-xs text-gray-400 italic">—</span>}
          {doctor.specializations?.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">+{doctor.specializations.length - 3}</span>
          )}
        </div>
      </td>

      <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-600 dark:text-gray-400">
        {doctor.qualifications?.length > 0 ? doctor.qualifications.slice(0, 2).join(', ') + (doctor.qualifications.length > 2 ? '…' : '') : <span className="text-xs text-gray-400 italic">—</span>}
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="space-y-0.5">
          {doctor.experienceYears > 0 && <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{doctor.experienceYears}y exp</div>}
          {doctor.consultationFee > 0 && <div className="text-xs text-gray-500">₹{doctor.consultationFee.toLocaleString()}</div>}
          {!doctor.experienceYears && !doctor.consultationFee && <span className="text-xs text-gray-400 italic">—</span>}
        </div>
      </td>

      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
        {user.phone || <span className="text-xs text-gray-400 italic">—</span>}
      </td>

      <td className="px-4 py-3">
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {active ? '● Active' : '○ Inactive'}
        </span>
      </td>

      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(doctor)} title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => onToggle(doctor)} title={active ? 'Deactivate' : 'Activate'} className={`p-1.5 rounded-lg transition-colors ${active ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600' : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600'}`}>
            {active
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorListPage() {
  const [doctors, setDoctors]           = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [filterDept, setFilterDept]     = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [departments, setDepartments]   = useState([]);
  const [staffUsers, setStaffUsers]     = useState([]);
  const [showModal, setShowModal]       = useState(false);
  const [editDoctor, setEditDoctor]     = useState(null);
  const [viewDoctor, setViewDoctor]     = useState(null);

  const PAGE_LIMIT = 15;

  const fetchDoctors = useCallback(async (pg = 1, dept = '', active = '') => {
    setLoading(true);
    try {
      const params = { page: pg, limit: PAGE_LIMIT };
      if (dept)   params.departmentId = dept;
      if (active) params.isActive = active;
      const { data } = await adminApi.getDoctors(params);
      const r = data.data;
      setDoctors(r.docs || []);
      setTotal(r.total || 0);
      setPage(r.page || 1);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const [deptRes, staffRes] = await Promise.all([
        adminApi.getDepartments({ limit: 100 }),
        adminApi.getStaff({ limit: 200, role: 'doctor' }),
      ]);
      setDepartments(deptRes.data.data?.docs || deptRes.data.data || []);
      setStaffUsers(staffRes.data.data?.docs || staffRes.data.data || []);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchDoctors(1); fetchMeta(); }, []);

  const handleDeptChange = e => { setFilterDept(e.target.value); fetchDoctors(1, e.target.value, filterActive); };
  const handleActiveChange = e => { setFilterActive(e.target.value); fetchDoctors(1, filterDept, e.target.value); };

  const handleToggle = async (doc) => {
    try {
      await adminApi.updateDoctor(doc._id, { isActive: !doc.isActive });
      toast.success(`Dr. ${doc.userId?.firstName} ${!doc.isActive ? 'activated' : 'deactivated'}`);
      fetchDoctors(page, filterDept, filterActive);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSaved = () => { setShowModal(false); setEditDoctor(null); fetchDoctors(1, filterDept, filterActive); };
  const handleEdit  = doc => { setEditDoctor(doc); setShowModal(true); };

  const totalPages   = Math.ceil(total / PAGE_LIMIT);
  const activeCount  = doctors.filter(d => d.isActive).length;

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="page-header mb-0 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctors</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} registered doctor${total !== 1 ? 's' : ''}` : 'No doctors yet'}
            {total > 0 && <span className="ml-2 text-green-600 dark:text-green-400 font-medium">· {activeCount} active</span>}
          </p>
        </div>
        <button id="btn-add-doctor" onClick={() => { setEditDoctor(null); setShowModal(true); }} className="btn-primary gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 py-4 flex-shrink-0">
        {departments.length > 0 && (
          <select value={filterDept} onChange={handleDeptChange} className="input py-2 max-w-[200px]">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        )}
        <select value={filterActive} onChange={handleActiveChange} className="input py-2 max-w-[150px]">
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
        <div className="flex-1" />
        <p className="text-sm text-gray-400">Click a row to view full profile</p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="table min-w-full">
          <thead>
            <tr>
              {[
                ['Doctor', ''],
                ['Department', 'hidden md:table-cell'],
                ['Specializations', 'hidden lg:table-cell'],
                ['Qualifications', 'hidden xl:table-cell'],
                ['Exp / Fee', 'hidden sm:table-cell'],
                ['Contact', 'hidden lg:table-cell'],
                ['Status', ''],
                ['', ''],
              ].map(([label, cls]) => (
                <th key={label} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/60 ${cls}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${50 + (j * 9) % 45}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : doctors.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-20 text-center">
                      <div className="text-6xl mb-4">👨‍⚕️</div>
                      <p className="text-gray-600 dark:text-gray-400 font-semibold text-xl">No doctors found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {filterDept || filterActive ? 'Try clearing your filters' : 'Add your first doctor profile to get started'}
                      </p>
                      {!filterDept && !filterActive && (
                        <button onClick={() => { setEditDoctor(null); setShowModal(true); }} className="btn-primary mt-6 gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Add First Doctor
                        </button>
                      )}
                    </td>
                  </tr>
                )
                : doctors.map(doc => (
                    <DoctorRow key={doc._id} doctor={doc} onEdit={handleEdit} onToggle={handleToggle} onView={setViewDoctor} />
                  ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 flex-shrink-0">
          <p className="text-sm text-gray-500">Page {page} of {totalPages} · {total} total</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => fetchDoctors(page - 1, filterDept, filterActive)} className="btn-secondary text-sm py-1.5 disabled:opacity-40">← Prev</button>
            <button disabled={page >= totalPages} onClick={() => fetchDoctors(page + 1, filterDept, filterActive)} className="btn-secondary text-sm py-1.5 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {viewDoctor && <DoctorDetailPanel doctor={viewDoctor} onClose={() => setViewDoctor(null)} onEdit={handleEdit} />}

      {/* Add/Edit Modal */}
      {showModal && (
        <DoctorModal
          doctor={editDoctor}
          departments={departments}
          staffUsers={staffUsers}
          onClose={() => { setShowModal(false); setEditDoctor(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

