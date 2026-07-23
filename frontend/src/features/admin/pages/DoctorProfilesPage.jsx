import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/admin.api';
import toast from 'react-hot-toast';

export default function DoctorProfilesPage() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]); // To map new profiles
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ 
    id: '', 
    userId: '', 
    departmentId: '', 
    specializations: '', 
    qualifications: '', 
    experienceYears: 0, 
    consultationFee: 0, 
    bio: '',
    isActive: true 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docRes, deptRes, userRes] = await Promise.all([
        adminApi.getDoctors(),
        adminApi.getDepartments(),
        // Get users with 'doctor' role (assuming slug 'doctor' or similar)
        // For now getting all active staff and filtering on client for simplicity, 
        // in production query by role slug.
        adminApi.getStaff({ isActive: 'true' })
      ]);
      setDoctors(docRes.data.data.docs || []);
      setDepartments(deptRes.data.data.docs || []);
      
      // Filter out users who already have a profile or aren't doctors
      // A robust implementation would filter by doctor role ID
      setUsers(userRes.data.data.docs || []);
    } catch (err) {
      toast.error('Failed to load doctor profiles');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({ 
      id: '', userId: '', departmentId: '', specializations: '', 
      qualifications: '', experienceYears: 0, consultationFee: 0, 
      bio: '', isActive: true 
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (doc) => {
    setForm({
      id: doc._id,
      userId: doc.userId?._id || '',
      departmentId: doc.departmentId?._id || '',
      specializations: doc.specializations?.join(', ') || '',
      qualifications: doc.qualifications?.join(', ') || '',
      experienceYears: doc.experienceYears || 0,
      consultationFee: doc.consultationFee || 0,
      bio: doc.bio || '',
      isActive: doc.isActive,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        departmentId: form.departmentId || null,
        specializations: form.specializations.split(',').map(s => s.trim()).filter(Boolean),
        qualifications: form.qualifications.split(',').map(s => s.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
        bio: form.bio,
        isActive: form.isActive,
      };

      if (isEditing) {
        await adminApi.updateDoctor(form.id, payload);
        toast.success('Doctor profile updated');
      } else {
        await adminApi.createDoctor({ ...payload, userId: form.userId });
        toast.success('Doctor profile created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Profiles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage doctor specializations, fees, and departments</p>
        </div>
        <button onClick={openAddModal} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add Profile
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium">Doctor</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium">Specialization</th>
                <th className="p-4 font-medium">Fee (₹)</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No doctor profiles found.</td></tr>
              ) : (
                doctors.map(doc => (
                  <tr key={doc._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">Dr. {doc.userId?.firstName} {doc.userId?.lastName}</div>
                      <div className="text-xs text-gray-500">{doc.userId?.email}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{doc.departmentId?.name || 'Unassigned'}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{doc.specializations?.[0] || '-'} {doc.specializations?.length > 1 && <span className="text-xs text-gray-400">(+{doc.specializations.length - 1})</span>}</td>
                    <td className="p-4 font-medium">{doc.consultationFee}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${doc.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEditModal(doc)} className="text-primary-600 hover:text-primary-800 font-medium text-sm">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up my-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Doctor Profile' : 'Create Doctor Profile'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">User Account *</label>
                  <select required disabled={isEditing} value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} className="input disabled:bg-gray-100 dark:disabled:bg-gray-800">
                    <option value="" disabled>Select User</option>
                    {isEditing ? (
                      <option value={form.userId}>Current User</option>
                    ) : (
                      users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)
                    )}
                  </select>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className="input">
                    <option value="">None</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Specializations (comma separated)</label>
                  <input value={form.specializations} onChange={e => setForm({...form, specializations: e.target.value})} className="input" placeholder="e.g. Cardiology, Pediatrics" />
                </div>
                <div>
                  <label className="label">Qualifications (comma separated)</label>
                  <input value={form.qualifications} onChange={e => setForm({...form, qualifications: e.target.value})} className="input" placeholder="e.g. MBBS, MD" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Experience (Years)</label>
                  <input type="number" min="0" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Consultation Fee (₹)</label>
                  <input type="number" min="0" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} className="input" />
                </div>
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="input min-h-[80px]" placeholder="Brief professional biography..." />
              </div>

              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</span>
              </label>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-5 py-2">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary px-5 py-2 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
