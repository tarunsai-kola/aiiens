import { useState, useEffect } from 'react';
import { hrApi } from '../../../api/hr.api';
import toast from 'react-hot-toast';

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await hrApi.getLeaveRequests();
      setLeaves(data.data || []);
    } catch (err) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await hrApi.updateLeaveStatus(id, status);
      toast.success(`Leave ${status}`);
      fetchLeaves();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-500">Approve or reject employee leave applications</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border-2 border-dashed border-gray-200 m-4 rounded-xl">
            No leave requests found.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Type & Reason</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold">{leave.userId?.firstName} {leave.userId?.lastName}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold">{leave.userId?.role?.replace('_', ' ')}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase">{leave.type}</span>
                    <div className="text-sm mt-1 text-gray-700">{leave.reason}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                      leave.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status}
                    </span>
                    {leave.approvedBy && <div className="text-[10px] text-gray-400 mt-1">By {leave.approvedBy.firstName}</div>}
                  </td>
                  <td className="p-4 text-right">
                    {leave.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateStatus(leave._id, 'Approved')} className="btn-primary py-1 px-3 text-xs">Approve</button>
                        <button onClick={() => handleUpdateStatus(leave._id, 'Rejected')} className="btn-secondary py-1 px-3 text-xs text-red-600">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
