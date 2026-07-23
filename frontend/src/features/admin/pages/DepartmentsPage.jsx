import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/admin.api';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', description: '', location: '', contactPhone: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await adminApi.getDepartments();
      // Backend returns paginated: { data: { docs: [...], total, page, ... } }
      const result = data.data;
      const list = Array.isArray(result) ? result : (result?.docs || []);
      setDepartments(list);
    } catch (err) {
      console.error('[Departments] fetch error:', err);
      toast.error(err?.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({ id: '', name: '', description: '', location: '', contactPhone: '', isActive: true });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setForm({
      id: dept._id,
      name: dept.name,
      description: dept.description || '',
      location: dept.location || '',
      contactPhone: dept.contactPhone || '',
      isActive: dept.isActive,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        location: form.location,
        contactPhone: form.contactPhone,
        isActive: form.isActive,
      };

      if (isEditing) {
        await adminApi.updateDepartment(form.id, payload);
        toast.success('Department updated');
      } else {
        await adminApi.createDepartment(payload);
        toast.success('Department created');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (dept) => {
    try {
      await adminApi.updateDepartment(dept._id, { isActive: !dept.isActive });
      toast.success(`Department ${dept.isActive ? 'deactivated' : 'activated'}`);
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage hospital departments and facilities</p>
        </div>
        <button onClick={openAddModal} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add Department
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium">Department Name</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Head Doctor</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No departments found.</td></tr>
              ) : (
                departments.map(dept => (
                  <tr key={dept._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{dept.name}</div>
                      {dept.contactPhone && <div className="text-xs text-gray-500 mt-0.5">{dept.contactPhone}</div>}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{dept.location || '-'}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {dept.headDoctorId ? `Dr. ${dept.headDoctorId.userId?.firstName} ${dept.headDoctorId.userId?.lastName}` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${dept.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEditModal(dept)} className="text-primary-600 hover:text-primary-800 font-medium text-sm mr-3">Edit</button>
                      <button onClick={() => toggleStatus(dept)} className={`${dept.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} font-medium text-sm`}>
                        {dept.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Department' : 'Add Department'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Department Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="e.g. Cardiology" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Location</label>
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input" placeholder="e.g. 2nd Floor, Wing A" />
                </div>
                <div>
                  <label className="label">Contact Phone</label>
                  <input value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="input" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</span>
              </label>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-5 py-2">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary px-5 py-2 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
