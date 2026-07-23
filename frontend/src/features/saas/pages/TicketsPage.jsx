import { useState, useEffect } from 'react';
import { saasApi } from '../../../api/saas.api';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await saasApi.getTickets();
      setTickets(data.data || []);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await saasApi.updateTicketStatus(id, status, 'Resolved by Super Admin');
      toast.success('Ticket updated');
      fetchTickets();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Support Tickets</h1>
        <p className="text-slate-400">Manage issues reported by hospital administrators.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading tickets...</div>
        ) : (
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-500 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="p-4">Hospital</th>
                <th className="p-4">Issue Subject</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tickets.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No tickets found</td></tr>}
              {tickets.map(ticket => (
                <tr key={ticket._id} className="hover:bg-slate-750 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white text-base">{ticket.hospitalId?.name}</div>
                    <div className="text-xs text-slate-500">{ticket.userId?.firstName} {ticket.userId?.lastName}</div>
                  </td>
                  <td className="p-4 max-w-md">
                    <div className="font-bold text-slate-300">{ticket.subject}</div>
                    <div className="text-xs text-slate-500 truncate">{ticket.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded font-bold text-xs ${
                      ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                      ticket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex gap-2 justify-end">
                    {ticket.status !== 'Resolved' && (
                      <>
                        <button onClick={() => updateStatus(ticket._id, 'In Progress')} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold">Investigate</button>
                        <button onClick={() => updateStatus(ticket._id, 'Resolved')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold">Resolve</button>
                      </>
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
