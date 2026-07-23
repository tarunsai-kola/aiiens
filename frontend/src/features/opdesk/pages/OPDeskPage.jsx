import { useState, useEffect } from 'react';
import { Search, Bell, Calendar, Stethoscope, Zap, Users, Box, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function OPDeskPage() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-gray-950 font-sans">
      
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
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
            <input 
              type="text" 
              placeholder="Search Patient Record..." 
              className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-full text-sm w-80 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800/30">
            <Clock className="w-4 h-4" />
            {time.toLocaleTimeString([], { hour12: false })}
          </div>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>
          
          <img 
            src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=0ea5e9&color=fff`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700"
          />
        </div>
      </header>

      {/* Main Content Scrollable Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Good Morning, {(user?.firstName + ' ' + user?.lastName).toUpperCase()}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              Welcome back to the Sunrise Multispeciality Internal Hub. You have 12 consultations today.
            </p>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold tracking-wider rounded-full uppercase border border-cyan-100 dark:border-cyan-800">
                SHIFT: MORNING
              </span>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wider rounded-full uppercase border border-emerald-100 dark:border-emerald-800">
                DEPT: CARDIOLOGY
              </span>
            </div>
          </div>
          
          <div className="flex gap-12 text-right">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">LOCAL TIME</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">OUTDOOR TEMP</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">32°C <span className="font-medium text-gray-500 text-xl ml-1">Clear</span></p>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL BED OCCUPANCY</h3>
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold text-blue-500">82%</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded">
                +4%
              </span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TODAY APPOINTMENTS</h3>
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold text-green-500">142</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded">
                Live
              </span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ACTIVE EMERGENCIES</h3>
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold text-red-500">03</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded">
                High
              </span>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">STAFF ON DUTY</h3>
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold text-blue-500">88/120</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded">
                Normal
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Hospital Bulletins */}
          <div className="col-span-2 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                  📢
                </span>
                Hospital Bulletins
              </h3>
              <button className="text-[10px] font-bold text-blue-500 uppercase tracking-wider hover:text-blue-600 transition-colors">
                VIEW ALL NEWS
              </button>
            </div>

            <div className="space-y-8">
              {/* Item 1 */}
              <div className="group border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md uppercase tracking-wider">ANNOUNCEMENT</span>
                  <span className="text-[11px] text-gray-400 font-medium">May 15, 2026</span>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors cursor-pointer">
                  New NABH Audit Scheduled
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The semi-annual NABH audit is scheduled for next week. Please ensure all documentation is up to date.
                </p>
              </div>

              {/* Item 2 */}
              <div className="group border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md uppercase tracking-wider">MEDICAL NEWS</span>
                  <span className="text-[11px] text-gray-400 font-medium">May 14, 2026</span>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors cursor-pointer">
                  New Cardio-Unit Protocol
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Updated protocols for post-operative cardiac care have been uploaded to the internal portal.
                </p>
              </div>

              {/* Item 3 */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md uppercase tracking-wider">SYSTEM UPDATE</span>
                  <span className="text-[11px] text-gray-400 font-medium">May 12, 2026</span>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors cursor-pointer">
                  AI Triage Model v2.4 Live
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The latest AI triage model is now active in the Emergency OPD, offering 15% better risk prediction.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Schedule & Links */}
          <div className="space-y-6">
            
            {/* My Schedule */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  My Schedule
                </h3>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  TODAY
                </span>
              </div>

              <div className="space-y-4">
                {/* Active Task */}
                <div className="p-5 rounded-2xl border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 relative">
                  <div className="absolute right-4 top-4 text-[9px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                    ACTIVE NOW
                  </div>
                  <p className="text-xs font-bold text-blue-500 mb-1">10:00 AM</p>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Cardiology Round</h4>
                  <p className="text-xs text-gray-500 mt-1">ICU Unit A</p>
                </div>

                {/* Upcoming */}
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 transition-colors">
                  <p className="text-xs font-bold text-gray-400 mb-1">11:30 AM</p>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Patient Consultation</h4>
                  <p className="text-xs text-gray-500 mt-1">OPD Room 204</p>
                </div>

                {/* Upcoming */}
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 transition-colors">
                  <p className="text-xs font-bold text-gray-400 mb-1">01:00 PM</p>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Department Meeting</h4>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-cyan-200 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6 text-cyan-500" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">NEW OPD</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-red-200 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-red-500" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">EMERGENCY</span>
              </button>

              <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ROSTER</span>
              </button>

              <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-amber-200 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Box className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">INVENTORY</span>
              </button>
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}
