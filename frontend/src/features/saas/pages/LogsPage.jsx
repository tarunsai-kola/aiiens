import { useState, useEffect } from 'react';
import { saasApi } from '../../../api/saas.api';
import toast from 'react-hot-toast';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await saasApi.getLogs();
      setLogs(data.data || []);
    } catch (err) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">System Logs</h1>
        <p className="text-slate-400">Global audit trail for Super Admin actions.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading logs...</div>
        ) : (
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-500 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Module</th>
                <th className="p-4">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {logs.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No logs found</td></tr>}
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-slate-750 transition-colors">
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-white">{log.action}</td>
                  <td className="p-4">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded font-bold text-xs uppercase">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {log.actorId ? `${log.actorId.firstName} ${log.actorId.lastName}` : 'System'}
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
