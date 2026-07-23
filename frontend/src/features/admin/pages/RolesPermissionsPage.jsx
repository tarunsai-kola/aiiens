import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/admin.api';
import toast from 'react-hot-toast';

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', description: '', permissions: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions()
      ]);
      setRoles(rolesRes.data.data || []);
      setPermissions(permsRes.data.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({ id: '', name: '', description: '', permissions: [] });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (role) => {
    if (role.type === 'system') {
      toast.error('System roles cannot be edited');
      return;
    }
    setForm({
      id: role._id,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleTogglePermission = (slug) => {
    setForm(prev => {
      const perms = new Set(prev.permissions);
      if (perms.has(slug)) perms.delete(slug);
      else perms.add(slug);
      return { ...prev, permissions: Array.from(perms) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        permissions: form.permissions,
      };

      if (isEditing) {
        await adminApi.updateRole(form.id, payload);
        toast.success('Role updated');
      } else {
        await adminApi.createRole(payload);
        toast.success('Role created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (role.type === 'system') return;
    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;
    
    try {
      await adminApi.deleteRole(role._id);
      toast.success('Role deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete role');
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, curr) => {
    if (!acc[curr.module]) acc[curr.module] = [];
    acc[curr.module].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage access control and custom roles</p>
        </div>
        <button onClick={openAddModal} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Create Custom Role
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium w-1/4">Role Name</th>
                <th className="p-4 font-medium w-1/4">Type</th>
                <th className="p-4 font-medium w-1/3">Permissions Count</th>
                <th className="p-4 font-medium text-right w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No roles found.</td></tr>
              ) : (
                roles.map(role => (
                  <tr key={role._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white capitalize">{role.name}</div>
                      {role.description && <div className="text-xs text-gray-500 mt-0.5">{role.description}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${role.type === 'system' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {role.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {role.permissions?.length || 0} Permissions
                    </td>
                    <td className="p-4 text-right">
                      {role.type === 'custom' ? (
                        <>
                          <button onClick={() => openEditModal(role)} className="text-primary-600 hover:text-primary-800 font-medium text-sm mr-3">Edit</button>
                          <button onClick={() => handleDelete(role)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Read-only</span>
                      )}
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-slide-up my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Custom Role' : 'Create Custom Role'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Role Name *</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="e.g. Senior Nurse" />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" placeholder="Role description..." />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Assign Permissions</h3>
                  <div className="space-y-6">
                    {Object.keys(groupedPermissions).map(module => (
                      <div key={module} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/20">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 capitalize mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">{module} Module</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {groupedPermissions[module].map(perm => (
                            <label key={perm.slug} className="flex items-start gap-2 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                checked={form.permissions.includes(perm.slug)}
                                onChange={() => handleTogglePermission(perm.slug)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{perm.name}</div>
                                <div className="text-xs text-gray-500">{perm.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-5 py-2">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary px-5 py-2 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
