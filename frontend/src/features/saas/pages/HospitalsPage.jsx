import { useState, useEffect } from 'react';
import { saasApi } from '../../../api/saas.api';
import toast from 'react-hot-toast';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data } = await saasApi.getHospitals();
      setHospitals(data.data || []);
    } catch (err) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const isActivating = !currentStatus;
    if (!window.confirm(`Are you sure you want to ${isActivating ? 'activate' : 'suspend'} this hospital?`)) return;

    try {
      await saasApi.toggleHospitalStatus(id, isActivating);
      toast.success(`Hospital ${isActivating ? 'Activated' : 'Suspended'}`);
      fetchHospitals();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Tenants (Hospitals)</h1>
        <p className="text-slate-400">Manage all registered hospital instances on the platform.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading tenants...</div>
        ) : (
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-500 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="p-4">Hospital Name</th>
                <th className="p-4">Domain / Slug</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {hospitals.map(hospital => (
                <tr key={hospital._id} className="hover:bg-slate-750 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white text-base">{hospital.name}</div>
                    <div className="text-xs text-slate-500">{hospital.contact?.email} | {hospital.contact?.primaryPhone}</div>
                  </td>
                  <td className="p-4 font-mono text-emerald-400">
                    {hospital.slug}.aiiens.com
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded font-bold text-xs">
                      {hospital.subscriptionPlanId?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4">
                    {hospital.isActive ? (
                      <span className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-400 font-bold text-xs">
                        <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]" />
                        SUSPENDED
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleToggle(hospital._id, hospital.isActive)}
                      className={`px-4 py-1.5 rounded font-bold text-xs transition-colors ${
                        hospital.isActive 
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {hospital.isActive ? 'Suspend' : 'Activate'}
                    </button>
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
