import { useState, useEffect } from 'react';
import { hrApi } from '../../../api/hr.api';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, attRes] = await Promise.all([
        hrApi.getStaffList(),
        hrApi.getAttendance({ date })
      ]);
      setStaff(staffRes.data.data || []);
      setAttendance(attRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (userId) => {
    const record = attendance.find(a => a.userId._id === userId || a.userId === userId);
    return record ? record.status : null;
  };

  const handleMark = async (userId, status) => {
    try {
      await hrApi.markAttendance({ userId, date, status });
      toast.success(`Marked ${status}`);
      // Optimistic update
      setAttendance(prev => {
        const existing = prev.find(a => a.userId._id === userId || a.userId === userId);
        if (existing) {
          return prev.map(a => (a.userId._id === userId || a.userId === userId) ? { ...a, status } : a);
        }
        return [...prev, { userId, date, status }];
      });
    } catch (err) {
      toast.error('Failed to mark attendance');
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Attendance</h1>
          <p className="text-gray-500">Mark staff attendance for {date}</p>
        </div>
        <div>
          <input type="date" className="input font-bold text-lg" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading attendance...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(user => {
                const currentStatus = getStatus(user._id);
                return (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 font-bold">{user.firstName} {user.lastName}</td>
                    <td className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">{user.role.replace('_', ' ')}</td>
                    <td className="p-4">
                      {currentStatus ? (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          currentStatus === 'Present' ? 'bg-green-100 text-green-800' :
                          currentStatus === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {currentStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not Marked</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleMark(user._id, 'Present')} className={`px-3 py-1 rounded text-xs font-bold border ${currentStatus === 'Present' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'}`}>Present</button>
                        <button onClick={() => handleMark(user._id, 'Absent')} className={`px-3 py-1 rounded text-xs font-bold border ${currentStatus === 'Absent' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}>Absent</button>
                        <button onClick={() => handleMark(user._id, 'Half-Day')} className={`px-3 py-1 rounded text-xs font-bold border ${currentStatus === 'Half-Day' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}>Half-Day</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
