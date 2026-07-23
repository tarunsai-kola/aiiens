import { useState, useEffect } from 'react';
import { Search, Bell, Clock, CheckCircle2, AlertCircle, Users, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function OPDRegistrationPage() {
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
          
          {/* Left Column: Queue */}
          <div className="w-[340px] shrink-0 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current OP List</h2>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md uppercase tracking-wider border border-blue-100 dark:border-blue-800/30">
                TOKEN SORTED
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-8">
              {/* Queue Item 1 */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-500 transition-colors">Vikram Singh Rathore</h3>
                    <p className="text-xs text-gray-500 font-medium">62 Yrs • Token #101</p>
                  </div>
                  <span className="text-2xl font-black text-blue-600">#1</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                  <span className="text-[10px]">📞</span> +91 88776 55443
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> Emergency Care</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded uppercase tracking-wider">OPD</span>
                </div>
              </div>

              {/* Queue Item 2 (Active) */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-md border-2 border-blue-500 relative cursor-pointer">
                <div className="absolute -top-3 right-4 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">Aravind Swamy</h3>
                    <p className="text-xs text-gray-500 font-medium">45 Yrs • Token #102</p>
                  </div>
                  <span className="text-2xl font-black text-blue-900 dark:text-blue-100">#4</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                  <span className="text-[10px]">📞</span> +91 98450 12345
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> Cardiology</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded uppercase tracking-wider">IN CONSULTATION</span>
                </div>
              </div>

              {/* Queue Item 3 */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-500 transition-colors">Priya Mukherjee</h3>
                    <p className="text-xs text-gray-500 font-medium">29 Yrs • Token #103</p>
                  </div>
                  <span className="text-2xl font-black text-blue-600">#5</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                  <span className="text-[10px]">📞</span> +91 91234 56789
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> Neurology</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded uppercase tracking-wider">VITAL SCREENING</span>
                </div>
              </div>

              {/* Queue Item 4 (Done) */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 opacity-60 relative">
                <div className="absolute -top-3 right-4 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base line-through decoration-gray-300">Meera Deshmukh</h3>
                    <p className="text-xs text-gray-500 font-medium">51 Yrs • Token #104</p>
                  </div>
                  <span className="text-2xl font-black text-gray-300">#0</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                  <span className="text-[10px]">📞</span> +91 99887 76655
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> Cardiology</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded uppercase tracking-wider">PRESCRIPTION DONE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Form */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">OPD Registration Details</h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">PATIENT ONBOARDING</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 flex-1 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-10 flex flex-col">
              
              <div className="mb-10 relative">
                <label className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px]">✓</span>
                  PATIENT IDENTIFICATION (ABHA/NDHM)
                </label>
                <div className="flex gap-4">
                  <input type="text" placeholder="Enter ABHA / Aadhaar Number" className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400" />
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-2 transition-colors">
                    <Search className="w-4 h-4" strokeWidth={3} /> Fetch Details
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OR MANUAL ENTRY</span>
                <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700"></div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-8">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">FULL NAME</label>
                    <input type="text" placeholder="Patient Name" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">AGE</label>
                    <input type="text" placeholder="Age" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">GENDER</label>
                    <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-gray-500">
                      <option>Select</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">MOBILE NUMBER</label>
                    <div className="flex gap-2">
                      <input type="text" defaultValue="+91" className="w-20 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 text-sm text-center outline-none font-medium" />
                      <input type="text" className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">ASSIGNED DEPARTMENT</label>
                    <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-gray-700">
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Orthopedics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CHIEF SYMPTOMS & REASON</label>
                    <button className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 hover:underline"><Clock className="w-3 h-3"/> HISTORY</button>
                  </div>
                  <textarea rows="4" placeholder="Describe symptoms briefly..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder-gray-400"></textarea>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button className="w-full bg-[#1da1f2] hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-colors text-sm tracking-wider uppercase shadow-lg shadow-blue-500/30">
                  CONFIRM & GENERATE TOKEN
                </button>
                <div className="flex gap-4">
                  <button className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm">
                     Save Draft
                  </button>
                  <button className="flex-1 bg-blue-50 border border-blue-100 text-blue-600 font-bold py-3.5 rounded-2xl hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm">
                    🖨️ Print Ticket
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Stats & Timeline */}
          <div className="w-[300px] shrink-0 flex flex-col space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 relative">
                  <Users className="w-5 h-5"/>
                  <span className="absolute -top-1 -right-4 text-[9px] font-bold text-green-600 bg-green-50 px-1 rounded border border-green-200">+12%</span>
                </div>
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">TODAY PATIENTS</h3>
                <span className="text-3xl font-black text-gray-900 dark:text-white">142</span>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3 relative">
                  <Zap className="w-5 h-5"/>
                  <span className="absolute -top-1 -right-6 text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-200 uppercase whitespace-nowrap">IN QUEUE</span>
                </div>
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">REMAINING</h3>
                <span className="text-3xl font-black text-gray-900 dark:text-white">56</span>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3 relative">
                  <Clock className="w-5 h-5"/>
                  <span className="absolute -top-1 -right-4 text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded border border-red-200">-2m</span>
                </div>
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">AVG WAIT</h3>
                <span className="text-3xl font-black text-gray-900 dark:text-white">18m</span>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3 relative">
                  <AlertCircle className="w-5 h-5"/>
                  <span className="absolute -top-1 -right-6 text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded border border-red-200 uppercase whitespace-nowrap">CRITICAL</span>
                </div>
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">EMERGENCY</h3>
                <span className="text-3xl font-black text-gray-900 dark:text-white">03</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 flex-1 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col relative overflow-hidden">
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2 text-center">PRESENT PATIENT DETAILS</h3>
              <h2 className="text-[13px] font-bold text-gray-900 dark:text-white text-center mb-8 pb-5 border-b border-gray-100">Token #102 — Aravind Swamy</h2>

              <div className="flex-1 relative pl-8 mt-4">
                <div className="absolute top-2 bottom-8 left-10 w-[2px] bg-gray-100 dark:bg-gray-800"></div>

                <div className="relative z-10 flex items-start gap-5 mb-10">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 border-[3px] border-white shadow-sm ring-4 ring-emerald-50">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1">OPD REGISTRATION</h4>
                  </div>
                </div>

                <div className="relative z-10 flex items-start gap-5 mb-10">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 border-[3px] border-white shadow-sm ring-4 ring-amber-50">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1">VITAL SCREENING</h4>
                  </div>
                </div>

                <div className="relative z-10 flex items-start gap-5 mb-10">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 border-[3px] border-white shadow-sm ring-4 ring-blue-50">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">IN CONSULTATION</h4>
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">LIVE PROCESSING</p>
                  </div>
                </div>

                <div className="relative z-10 flex items-start gap-5">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border-[3px] border-white shrink-0 mt-0.5 shadow-sm"></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">PRESCRIPTION DONE</h4>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
