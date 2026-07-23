import { useState, useEffect } from 'react';
import { Search, Bell, Clock, Activity, HeartPulse, Thermometer, Droplets, Wind, Scale, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function OPDVitalsPage() {
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
          
          {/* Left Column: Triage Queue */}
          <div className="w-[340px] shrink-0 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Vitals Queue</h2>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-md uppercase tracking-wider border border-amber-100 dark:border-amber-800/30">
                PENDING TRIAGE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-8">
              {/* Queue Item (Active) */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-md border-2 border-blue-500 relative cursor-pointer">
                <div className="absolute -top-3 right-4 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <Activity className="w-3 h-3" />
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">Priya Mukherjee</h3>
                    <p className="text-xs text-gray-500 font-medium">29 Yrs • Female</p>
                  </div>
                  <span className="text-2xl font-black text-blue-900 dark:text-blue-100">#103</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> Neurology</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded uppercase tracking-wider">WAITING</span>
                </div>
              </div>

              {/* Queue Item 2 */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-500 transition-colors">Rajesh Kumar</h3>
                    <p className="text-xs text-gray-500 font-medium">42 Yrs • Male</p>
                  </div>
                  <span className="text-2xl font-black text-blue-600">#105</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> Orthopedics</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded uppercase tracking-wider">WAITING</span>
                </div>
              </div>

              {/* Queue Item 3 (Emergency) */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-red-100 relative hover:border-red-300 hover:shadow-md transition-all cursor-pointer group bg-red-50/10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-red-600 text-base">Unknown Patient</h3>
                    <p className="text-xs text-red-400 font-medium">~30 Yrs • Male</p>
                  </div>
                  <span className="text-2xl font-black text-red-500">#106</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> Emergency</span>
                  <span className="text-[9px] font-bold px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> CRITICAL</span>
                </div>
              </div>

            </div>
          </div>

          {/* Middle Column: Form */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Vitals Entry</h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">NURSE STATION</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 flex-1 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-10 flex flex-col">
              
              {/* Patient Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    PM
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Token #103 — Priya Mukherjee</h3>
                    <p className="text-sm text-gray-500">29 Yrs • Female • Neurology OPD</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CHIEF COMPLAINT</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-300">Severe Migraine, Nausea</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 flex-1">
                
                {/* Blood Pressure */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><HeartPulse className="w-3.5 h-3.5" /></div>
                      BLOOD PRESSURE
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <input type="text" placeholder="120/80" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                    <span className="text-xs font-bold text-gray-400 pb-3">mmHg</span>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><Activity className="w-3.5 h-3.5" /></div>
                      HEART RATE
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <input type="number" placeholder="72" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                    <span className="text-xs font-bold text-gray-400 pb-3">BPM</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><Thermometer className="w-3.5 h-3.5" /></div>
                      TEMPERATURE
                    </label>
                    <select className="text-[10px] font-bold text-gray-500 bg-transparent outline-none uppercase cursor-pointer">
                      <option>°F</option>
                      <option>°C</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <input type="number" step="0.1" placeholder="98.6" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                  </div>
                </div>

                {/* SpO2 */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center"><Wind className="w-3.5 h-3.5" /></div>
                      SpO2 (OXYGEN)
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <input type="number" placeholder="99" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                    <span className="text-xs font-bold text-gray-400 pb-3">%</span>
                  </div>
                </div>

                {/* Weight / Height */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors col-span-2">
                   <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><Scale className="w-3.5 h-3.5" /></div>
                      PHYSICAL STATS
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-end gap-2">
                      <input type="number" placeholder="Weight" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                      <span className="text-xs font-bold text-gray-400 pb-3">kg</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <input type="number" placeholder="Height" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                      <span className="text-xs font-bold text-gray-400 pb-3">cm</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                <button className="flex-1 bg-[#1da1f2] hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-colors text-sm tracking-wider uppercase shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save Vitals & Send to Doctor
                </button>
                <button className="px-8 bg-white border border-red-200 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm">
                  <AlertTriangle className="w-4 h-4" /> Flag Critical
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: History & Alerts */}
          <div className="w-[300px] shrink-0 flex flex-col space-y-6">
            <div className="bg-white dark:bg-gray-900 flex-1 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col relative overflow-hidden">
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2 text-center">CLINICAL ALERTS</h3>
              <h2 className="text-[13px] font-bold text-gray-900 dark:text-white text-center mb-8 pb-5 border-b border-gray-100">Previous History</h2>

              <div className="flex flex-col gap-4">
                {/* History Item */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">MAR 12, 2026</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">GENERAL</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mb-1">BP was slightly elevated</p>
                  <p className="text-xs text-gray-500">Recorded: 135/85 mmHg</p>
                </div>

                {/* History Item */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">ALLERGY ALERT</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Penicillin</p>
                  <p className="text-xs text-gray-500">Patient reported severe reaction.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
