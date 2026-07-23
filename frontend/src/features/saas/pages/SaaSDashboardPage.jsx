import { useState, useEffect } from 'react';
import { saasApi } from '../../../api/saas.api';
import toast from 'react-hot-toast';

export default function SaaSDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await saasApi.getDashboardStats();
      setStats(data.data);
    } catch (err) {
      toast.error('Failed to load platform stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="text-slate-500 animate-pulse">Loading Platform Matrix...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Global Overview</h1>
        <p className="text-slate-400">Live metrics across all multi-tenant installations.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total MRR (30d)</p>
          <h2 className="text-4xl font-black text-emerald-400">₹{stats.mrr.toLocaleString()}</h2>
        </div>
        
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Hospitals</p>
          <h2 className="text-4xl font-black text-white">{stats.hospitalsCount}</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Active Hospitals</p>
          <h2 className="text-4xl font-black text-blue-400">{stats.activeHospitals}</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Open Tickets</p>
          <h2 className="text-4xl font-black text-red-400">{stats.activeTickets}</h2>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-96 flex items-center justify-center shadow-xl">
         <p className="text-slate-500 font-mono text-sm">[ MRR Growth Chart Placeholder - Pending sufficient data ]</p>
      </div>
    </div>
  );
}
