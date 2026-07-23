import { useState, useEffect } from 'react';
import { Search, Bell, Clock, Filter, Calendar as CalendarIcon, FileText, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function OPDHistoryPage() {
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
        <div className="max-w-[1400px] mx-auto flex flex-col h-full">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Previous OPD Records</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Review past consultations, diagnoses, and prescriptions.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-1">
                <button className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl">All Records</button>
                <button className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 rounded-xl">Follow-ups</button>
                <button className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 rounded-xl">Admitted</button>
              </div>
              <button className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold py-2.5 px-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm shadow-sm">
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 flex-1 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">DATE & TIME</div>
              <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">PATIENT & TOKEN</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">DEPARTMENT</div>
              <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">PRIMARY COMPLAINT</div>
              <div className="col-span-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">STATUS</div>
              <div className="col-span-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">ACTION</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              
              {/* Row 1 */}
              <div className="grid grid-cols-12 gap-4 px-6 py-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 group">
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Today, 09:15 AM</p>
                  <p className="text-xs text-gray-500">May 16, 2026</p>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">#98</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Rahul Sharma</p>
                      <p className="text-xs text-gray-500">34 Yrs • Male</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Cardiology</p>
                  <p className="text-xs text-gray-500">Dr. Anjali Gupta</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-300 truncate pr-4">Chest pain, shortness of breath</p>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="text-[9px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded uppercase tracking-wider">COMPLETED</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors shadow-sm">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-12 gap-4 px-6 py-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 group">
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Yesterday, 14:30 PM</p>
                  <p className="text-xs text-gray-500">May 15, 2026</p>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">#42</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Smriti Irani</p>
                      <p className="text-xs text-gray-500">45 Yrs • Female</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Orthopedics</p>
                  <p className="text-xs text-gray-500">Dr. Rakesh Singh</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-300 truncate pr-4">Severe knee joint pain</p>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="text-[9px] font-bold px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded uppercase tracking-wider">FOLLOW-UP</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors shadow-sm">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-12 gap-4 px-6 py-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 group">
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">May 14, 11:00 AM</p>
                  <p className="text-xs text-gray-500">May 14, 2026</p>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">#12</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Arjun Das</p>
                      <p className="text-xs text-gray-500">22 Yrs • Male</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Emergency</p>
                  <p className="text-xs text-gray-500">Dr. Vivek Murthy</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-300 truncate pr-4">Head trauma from accident</p>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="text-[9px] font-bold px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded uppercase tracking-wider">ADMITTED</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors shadow-sm">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 font-medium">Showing <span className="font-bold text-gray-900 dark:text-white">1</span> to <span className="font-bold text-gray-900 dark:text-white">10</span> of <span className="font-bold text-gray-900 dark:text-white">1,248</span> records</p>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm">
                  1
                </button>
                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  2
                </button>
                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  3
                </button>
                <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
