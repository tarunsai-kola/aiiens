import { useState, useEffect } from 'react';
import { notificationApi } from '../../../api/notifications.api';
import toast from 'react-hot-toast';

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await notificationApi.getAdminLogs();
      setLogs(data.data || []);
    } catch (err) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Outbound Communications</h1>
          <p className="text-gray-500">Log of all SMS, Emails, and Push Notifications sent by the system</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading logs...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Message</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-gray-500">
                    <div className="font-bold text-gray-800">{new Date(log.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs">{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${
                      log.channel === 'sms' ? 'bg-blue-100 text-blue-800' :
                      log.channel === 'email' ? 'bg-purple-100 text-purple-800' :
                      log.channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.channel}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{log.contactDetail || 'In-App User'}</div>
                    <div className="text-xs text-gray-500">{log.recipientModel}</div>
                  </td>
                  <td className="p-4 max-w-md">
                    <div className="font-bold text-gray-800">{log.title}</div>
                    <div className="text-xs text-gray-600 truncate">{log.message}</div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.status === 'sent' ? 'bg-green-100 text-green-800' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status}
                    </span>
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
