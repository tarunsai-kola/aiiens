import { useState, useEffect } from 'react';
import { hrApi } from '../../../api/hr.api';
import toast from 'react-hot-toast';

export default function DutyRosterPage() {
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, staffRes, rosterRes] = await Promise.all([
        hrApi.getShifts(),
        hrApi.getStaffList(),
        hrApi.getRoster({ startDate: date, endDate: date })
      ]);
      setShifts(shiftsRes.data.data || []);
      setStaff(staffRes.data.data || []);
      setRoster(rosterRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load roster data');
    } finally {
      setLoading(false);
    }
  };

  const getAssignedShift = (userId) => {
    const r = roster.find(r => r.userId._id === userId || r.userId === userId);
    return r ? r.shiftId : null;
  };

  const handleAssign = async (userId, shiftId) => {
    try {
      await hrApi.assignRoster({ userId, shiftId, date });
      toast.success('Shift assigned');
      fetchData(); // reload
    } catch (err) {
      toast.error('Failed to assign shift');
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const startTime = e.target.startTime.value;
    const endTime = e.target.endTime.value;
    try {
      await hrApi.createShift({ name, startTime, endTime });
      toast.success('Shift Created');
      e.target.reset();
      fetchData();
    } catch (err) {
      toast.error('Failed to create shift');
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Duty Roster</h1>
          <p className="text-gray-500">Assign shifts to employees for {date}</p>
        </div>
        <div>
          <input type="date" className="input font-bold text-lg" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading roster...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Shift</th>
                  <th className="p-4">Assign</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(user => {
                  const shift = getAssignedShift(user._id);
                  return (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-bold">{user.firstName} {user.lastName}</td>
                      <td className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">{user.role.replace('_', ' ')}</td>
                      <td className="p-4">
                        {shift ? (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{shift.name} ({shift.startTime}-{shift.endTime})</span>
                        ) : (
                          <span className="text-gray-400 italic">Off Duty</span>
                        )}
                      </td>
                      <td className="p-4">
                        <select 
                          className="input text-xs py-1 px-2"
                          value={shift?._id || ''}
                          onChange={e => handleAssign(user._id, e.target.value)}
                        >
                          <option value="">Off Duty</option>
                          {shifts.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold mb-4">Available Shifts</h2>
            <ul className="space-y-2 mb-6">
              {shifts.map(s => (
                <li key={s._id} className="bg-gray-50 p-2 rounded flex justify-between border border-gray-100">
                  <span className="font-bold">{s.name}</span>
                  <span className="text-gray-500 font-mono text-xs">{s.startTime} - {s.endTime}</span>
                </li>
              ))}
            </ul>
            
            <form onSubmit={handleCreateShift} className="border-t pt-4 space-y-4">
              <h3 className="font-bold text-sm text-gray-500">Create New Shift</h3>
              <input type="text" name="name" required placeholder="Shift Name (e.g. Morning)" className="input text-sm" />
              <div className="flex gap-2">
                <input type="time" name="startTime" required className="input text-sm" />
                <input type="time" name="endTime" required className="input text-sm" />
              </div>
              <button type="submit" className="btn-primary w-full text-sm">Add Shift</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
