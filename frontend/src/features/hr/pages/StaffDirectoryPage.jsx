import { useState, useEffect } from 'react';
import { hrApi } from '../../../api/hr.api';
import toast from 'react-hot-toast';

export default function StaffDirectoryPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [activeStaff, setActiveStaff] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '', designation: '', baseSalary: 0, bankName: '', accountNumber: '', panNumber: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await hrApi.getStaffList();
      setStaff(data.data || []);
    } catch (err) {
      toast.error('Failed to load staff directory');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setActiveStaff(user);
    setFormData({
      employeeId: user.profile?.employeeId || '',
      designation: user.profile?.designation || '',
      baseSalary: user.profile?.baseSalary || 0,
      bankName: user.profile?.bankName || '',
      accountNumber: user.profile?.accountNumber || '',
      panNumber: user.profile?.panNumber || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await hrApi.updateStaffProfile(activeStaff._id, formData);
      toast.success('Staff profile updated');
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Directory</h1>
          <p className="text-gray-500">Manage employee profiles and payroll settings</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading directory...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Role / Designation</th>
                <th className="p-4 text-right">Base Salary</th>
                <th className="p-4 text-center">Profile Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(user => (
                <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-gray-500">{user.email} | {user.phone}</div>
                    {user.profile?.employeeId && <div className="text-xs font-mono mt-1 text-primary-600">ID: {user.profile.employeeId}</div>}
                  </td>
                  <td className="p-4">
                    <span className="uppercase text-xs font-bold tracking-widest text-gray-400">{user.role.replace('_', ' ')}</span>
                    {user.profile?.designation && <div className="font-bold text-gray-800">{user.profile.designation}</div>}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-gray-700">
                    ₹{user.profile?.baseSalary?.toLocaleString() || 0}
                  </td>
                  <td className="p-4 text-center">
                    {user.profile ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Complete</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">Incomplete</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(user)} className="btn-secondary py-1 px-3 text-xs">Edit HR Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="font-bold">HR Profile: {activeStaff?.firstName} {activeStaff?.lastName}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee ID</label>
                  <input type="text" className="input uppercase" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                </div>
                <div>
                  <label className="label">Designation</label>
                  <input type="text" className="input" placeholder="e.g. Senior Nurse" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Base Salary (₹ per month)</label>
                  <input type="number" className="input" required value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} />
                </div>
              </div>
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Bank Name</label>
                  <input type="text" className="input" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Account Number</label>
                  <input type="text" className="input" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
                </div>
                <div>
                  <label className="label">PAN Number</label>
                  <input type="text" className="input uppercase" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
