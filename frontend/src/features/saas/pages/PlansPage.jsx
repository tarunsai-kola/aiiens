import { useState, useEffect } from 'react';
import { saasApi } from '../../../api/saas.api';
import toast from 'react-hot-toast';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await saasApi.getPlans();
      setPlans(data.data || []);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Subscription Plans</h1>
        <p className="text-slate-400">Manage pricing tiers and feature flags.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-500">Loading plans...</div>
        ) : (
          plans.map(plan => (
            <div key={plan._id} className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-700">
                <div className="flex justify-between items-start">
                   <h2 className="text-xl font-bold text-white uppercase">{plan.name}</h2>
                   {plan.isPopular && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded font-bold uppercase">Popular</span>}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-white">₹{plan.price.monthly}</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
              </div>
              <div className="p-6 flex-1 space-y-4 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Users</span>
                  <span className="font-bold text-white">{plan.limits.maxUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Patients</span>
                  <span className="font-bold text-white">{plan.limits.maxPatients}</span>
                </div>
                <hr className="border-slate-700" />
                <h4 className="font-bold text-white text-xs uppercase tracking-widest">Features</h4>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${plan.features.pharmacyModule ? 'text-emerald-400' : 'text-slate-600 line-through'}`}>
                     <span>Pharmacy POS</span>
                  </div>
                  <div className={`flex items-center gap-2 ${plan.features.laboratoryModule ? 'text-emerald-400' : 'text-slate-600 line-through'}`}>
                     <span>Laboratory LIMS</span>
                  </div>
                  <div className={`flex items-center gap-2 ${plan.features.wardsModule ? 'text-emerald-400' : 'text-slate-600 line-through'}`}>
                     <span>IPD Wards</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-900 border-t border-slate-700">
                <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-sm transition-colors">
                  Edit Plan
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
