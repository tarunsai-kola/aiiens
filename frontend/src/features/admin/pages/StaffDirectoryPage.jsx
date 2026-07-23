import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/admin.api';
import { authApi } from '../../../api/auth.api';
import toast from 'react-hot-toast';

export default function StaffDirectoryPage() {
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({ search: '', roleId: '', isActive: '' });
  
  // Invite Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', roleId: '' });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes] = await Promise.all([
        adminApi.getStaff(filters),
        adminApi.getRoles()
      ]);
      // Backend returns paginated: data.data = { docs: [...], total, page, limit }
      const staffResult = staffRes.data.data;
      const staffDocs = Array.isArray(staffResult) ? staffResult : (staffResult?.docs || []);
      setStaffList(staffDocs);

      const rolesResult = rolesRes.data.data;
      setRoles(Array.isArray(rolesResult) ? rolesResult : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await authApi.inviteStaff(form);
      toast.success('Staff invitation sent via email');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', roleId: '' });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const toggleStatus = async (staff) => {
    try {
      if (staff.isActive) {
        await adminApi.deactivateStaff(staff._id);
        toast.success('Staff deactivated');
      } else {
        await adminApi.activateStaff(staff._id);
        toast.success('Staff activated');
      }
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage hospital employees, roles, and access</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Invite Staff
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
          <input 
            placeholder="Name or email..." 
            className="input !py-2 text-sm w-full"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <div className="w-48">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
          <select 
            className="input !py-2 text-sm w-full"
            value={filters.roleId}
            onChange={(e) => setFilters(f => ({ ...f, roleId: e.target.value }))}
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
          <select 
            className="input !py-2 text-sm w-full"
            value={filters.isActive}
            onChange={(e) => setFilters(f => ({ ...f, isActive: e.target.value }))}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : staffList.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No staff found matching filters.</td></tr>
              ) : (
                staffList.map(staff => (
                  <tr key={staff._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase">
                          {staff.firstName[0]}{staff.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{staff.firstName} {staff.lastName}</div>
                          {!staff.isEmailVerified && <div className="text-[10px] text-amber-600 font-medium">Pending Invite</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                        {staff.roleId?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-600 dark:text-gray-400">{staff.email}</div>
                      {staff.phone && <div className="text-xs text-gray-500 mt-0.5">{staff.phone}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${staff.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => toggleStatus(staff)} className={`${staff.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} font-medium text-sm`}>
                        {staff.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invite Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" placeholder="staff@hospital.com" />
              </div>
              <div>
                <label className="label">Assign Role *</label>
                <select required value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})} className="input">
                  <option value="" disabled>Select a role...</option>
                  {roles.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-xs mt-2">
                An invitation email will be sent to the user with a secure link to set their password.
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-5 py-2">Cancel</button>
                <button type="submit" disabled={inviting} className="btn-primary px-5 py-2 disabled:opacity-60">
                  {inviting ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
