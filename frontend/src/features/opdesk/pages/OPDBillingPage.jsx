import { useState, useEffect } from 'react';
import { Search, Bell, Clock, CreditCard, TrendingUp, IndianRupee, FileText, Download, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function OPDBillingPage() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-gray-950 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            Sunrise Multispeciality Hospital
          </h1>
          <p className="text-[10px] font-bold text-blue-500 tracking-wider uppercase">
            NABH ACCREDITED HOSPITAL
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search Patient Record..." className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-full text-sm w-80 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none placeholder-gray-400" />
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800/30">
            <Clock className="w-4 h-4" />
            {time.toLocaleTimeString([], { hour12: false })}
          </div>
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>
          <img src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=0ea5e9&color=fff`} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex gap-8 h-full max-w-[1600px] mx-auto">
          
          {/* Left Column: Metrics & History */}
          <div className="flex-1 flex flex-col min-w-0 space-y-6">
            
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payments & Billing</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage invoices, collect payments, and track daily revenue.</p>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +14%</span>
                </div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL REVENUE TODAY</h3>
                <p className="text-3xl font-black text-gray-900 dark:text-white">₹ 42,500</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">PENDING INVOICES</h3>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-black text-gray-900 dark:text-white">12</p>
                  <p className="text-sm font-bold text-amber-500 mb-1">~ ₹ 8,400</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SUCCESS RATE</h3>
                <p className="text-3xl font-black text-gray-900 dark:text-white">98.5%</p>
              </div>
            </div>

            {/* Trends Chart Placeholder */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-64 relative overflow-hidden">
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-4">REVENUE TRENDS</h3>
              <div className="flex-1 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/30">
                 <p className="text-sm font-bold text-gray-400 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Revenue Analytics Chart Placeholder</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">RECENT TRANSACTIONS</h3>
                <button className="text-[10px] font-bold text-gray-500 uppercase hover:text-blue-500 transition-colors">VIEW ALL</button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                
                {/* Row 1 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Vikram Singh Rathore</p>
                      <p className="text-xs text-gray-500">Token #101 • OPD Consultation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">₹ 800</p>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase">PAID</span>
                  </div>
                  <div>
                    <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Aravind Swamy</p>
                      <p className="text-xs text-gray-500">Token #102 • Lab Tests</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">₹ 2,450</p>
                    <span className="text-[9px] font-bold text-amber-500 uppercase">PENDING</span>
                  </div>
                  <div>
                    <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Priya Mukherjee</p>
                      <p className="text-xs text-gray-500">Token #103 • Pharmacy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">₹ 1,120</p>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase">PAID</span>
                  </div>
                  <div>
                    <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Generate Bill */}
          <div className="w-[420px] shrink-0 flex flex-col space-y-6">
            <div className="bg-white dark:bg-gray-900 flex-1 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col relative">
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
                  <input type="text" placeholder="e.g. #102 or Aravind..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900" />
                </div>
              </div>

              {/* Bill Preview Area */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Aravind Swamy</h4>
                    <p className="text-xs text-gray-500">Token #102 • Cardiology</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">DRAFT</span>
                </div>

                <div className="flex-1 space-y-4">
                  
                  {/* Item */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">OPD Consultation Fee</p>
                      <p className="text-[10px] text-gray-500">Dr. Vivek Murthy</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">₹ 600</p>
                  </div>

                  {/* Item */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Registration Charges</p>
                      <p className="text-[10px] text-gray-500">New Patient</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">₹ 200</p>
                  </div>

                  <button className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-600 mt-4">
                    <Plus className="w-3 h-3" /> Add Custom Item
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="font-bold text-gray-900">₹ 800</p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">Tax (0%)</p>
                    <p className="font-bold text-gray-900">₹ 0</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TOTAL AMOUNT</p>
                    <p className="text-3xl font-black text-emerald-500">₹ 800</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-colors text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" /> Process Payment
                </button>
                <button className="w-full bg-white border border-gray-200 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
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
