import { useState, useEffect } from 'react';
import { dashboardApi } from '../../../api/dashboard.api';
import toast from 'react-hot-toast';
import { 
  IndianRupee, Users, Calendar, BedDouble, 
  Activity, AlertTriangle, Stethoscope 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getStats();
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading Live Dashboard...</div>;
  }

  if (!data) return null;

  const { kpis, lowStockItems, recentActivities, trends } = data;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Hospital Overview</h1>
        <p className="text-gray-500 font-bold">Live operational metrics and analytics</p>
      </div>

      {/* KPI RIBBON */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Today's Revenue</p>
            <h2 className="text-3xl font-black text-gray-900">₹{kpis.todayRevenue.toLocaleString()}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">New Patients</p>
            <h2 className="text-3xl font-black text-gray-900">{kpis.todayPatients}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Appointments</p>
            <h2 className="text-3xl font-black text-gray-900">{kpis.todayAppointments}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Bed Occupancy</p>
            <h2 className="text-3xl font-black text-gray-900">{kpis.occupancyRate}%</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <BedDouble size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHARTS */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" /> 7-Day Trend
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" />
                <Area yAxisId="right" type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAppt)" name="Appointments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE PANELS */}
        <div className="space-y-6">
          
          {/* STAFF WIDGET */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
             <div>
                <h3 className="font-bold text-gray-800 text-lg">Active Staff</h3>
                <p className="text-sm text-gray-500">{kpis.doctorsCount} Doctors</p>
             </div>
             <div className="w-14 h-14 rounded-full bg-teal-50 border-4 border-teal-100 flex items-center justify-center text-teal-600 font-black text-xl">
               {kpis.totalStaff}
             </div>
          </div>

          {/* ALERTS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-800">
              <AlertTriangle size={18} />
              <h3 className="font-bold">Low Stock Alerts</h3>
            </div>
            <div className="p-4 space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Inventory levels are healthy.</p>
              ) : (
                lowStockItems.map(item => (
                  <div key={item._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-700">{item.brandName || item.genericName || 'Unknown'}</span>
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                      {item.stockQuantity} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Recent Activities</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No recent activities.</p>
                ) : (
                  recentActivities.map(log => (
                    <div key={log._id} className="flex gap-3">
                      <div className="mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          log.channel === 'sms' ? 'bg-blue-500' :
                          log.channel === 'email' ? 'bg-purple-500' :
                          'bg-green-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{log.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{log.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
