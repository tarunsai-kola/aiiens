import { useState, useEffect } from 'react';
import { Search, Bell, Clock, CreditCard, TrendingUp, IndianRupee, FileText, Download, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { appointmentApi } from '../../../api/appointment.api';
import { billingApi } from '../../../api/billing.api';

export default function OPDBillingPage() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, count: 0 });
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchData();
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const billsRes = await billingApi.getBills({ limit: 15 });
      const fetchedBills = billsRes.data.data || [];
      
      let revenue = 0;
      fetchedBills.forEach(b => revenue += (b.netTotal || 0));

      setBills(fetchedBills);
      setStats({ revenue, count: fetchedBills.length });
      if (fetchedBills.length > 0) setSelectedBill(fetchedBills[0]);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-gray-950 font-sans">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex xl:flex-row flex-col gap-6 h-full max-w-[1600px] mx-auto">
          
          {/* Left Column: Metrics & History */}
          <div className="flex-1 flex flex-col min-w-0 space-y-6">
            
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payments & Billing</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage invoices, collect payments, and track daily revenue.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +14%</span>
                </div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL REVENUE TODAY</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white">₹ {stats.revenue.toLocaleString()}</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL INVOICES</h3>
                <div className="flex items-end gap-3">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.count}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SUCCESS RATE</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white">98.5%</p>
              </div>
            </div>

            {/* Trends Chart Placeholder */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-48 relative overflow-hidden">
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-3">REVENUE TRENDS</h3>
              <div className="flex-1 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/30">
                 <p className="text-sm font-bold text-gray-400 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Revenue Analytics Chart Placeholder</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">RECENT TRANSACTIONS</h3>
                <button className="text-[10px] font-bold text-gray-500 uppercase hover:text-blue-500 transition-colors">VIEW ALL</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                
                {bills.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">No recent transactions</div>
                ) : (
                  bills.map(bill => (
                    <div 
                      key={bill._id}
                      onClick={() => setSelectedBill(bill)}
                      className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border transition-colors cursor-pointer ${selectedBill?._id === bill._id ? 'border-blue-500 shadow-sm' : 'border-transparent hover:border-blue-100'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bill.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {bill.status === 'paid' ? <IndianRupee className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {bill.patientId?.firstName} {bill.patientId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">Bill ID: {bill._id.toString().slice(-6).toUpperCase()} • {bill.items?.[0]?.name || 'OPD'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900 dark:text-white">₹ {bill.netTotal}</p>
                        <span className={`text-[9px] font-bold uppercase ${bill.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{bill.status}</span>
                      </div>
                      <div>
                        <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

              </div>
            </div>

          </div>

          {/* Right Column: Generate Bill */}
          <div className="xl:w-[400px] w-full shrink-0 flex flex-col space-y-6">
            <div className="bg-white dark:bg-gray-900 flex-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate Bill</h3>
                <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">PATIENT TOKEN / NAME</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="e.g. #102 or Aravind..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 dark:text-white" />
                </div>
              </div>

              {/* Bill Preview Area */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col">
                <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {selectedBill ? `${selectedBill.patientId?.firstName} ${selectedBill.patientId?.lastName}` : 'No Bill Selected'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {selectedBill ? `Bill ID: #${selectedBill._id.toString().slice(-6).toUpperCase()}` : '—'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${selectedBill?.status === 'paid' ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'}`}>
                    {selectedBill?.status || 'DRAFT'}
                  </span>
                </div>

                <div className="flex-1 space-y-4">
                  
                  {selectedBill?.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">₹ {item.subTotal}</p>
                    </div>
                  ))}

                  <button className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-600 mt-4">
                    <Plus className="w-3 h-3" /> Add Custom Item
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="font-bold text-gray-900 dark:text-white">₹ {selectedBill?.grossTotal || 0}</p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">Discount</p>
                    <p className="font-bold text-gray-900 dark:text-white">₹ {selectedBill?.totalDiscount || 0}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TOTAL DUE</p>
                    <p className="text-3xl font-black text-emerald-500">₹ {selectedBill?.amountDue || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" /> Process Payment
                </button>
                <button className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2">
                  Save Invoice Draft
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
