import { useState, useEffect } from 'react';
import { Search, Bell, Clock, Filter, Calendar as CalendarIcon, FileText, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { appointmentApi } from '../../../api/appointment.api';

export default function OPDHistoryPage() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchHistory();
    return () => clearInterval(timer);
  }, [pagination.page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await appointmentApi.getAll({ page: pagination.page, limit: pagination.limit });
      setAppointments(data.data.docs || []);
      setPagination(prev => ({ ...prev, total: data.data.total || 0 }));
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'waiting': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'triage': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-gray-950 font-sans">
      <main className="flex-1 overflow-y-auto p-6">
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

          <div className="bg-white dark:bg-gray-900 flex-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 xl:p-8 flex flex-col">
            
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
              
              {loading ? (
                <div className="text-center py-10 text-gray-500">Loading records...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No records found.</div>
              ) : (
                appointments.map(apt => (
                  <div key={apt._id} className="grid grid-cols-12 gap-4 px-6 py-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 group">
                    <div className="col-span-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {new Date(apt.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          #{apt.tokenNumber}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {apt.patientId?.firstName} {apt.patientId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{apt.patientId?.age || '?'} Yrs • {apt.patientId?.gender || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{apt.departmentId?.name || 'General'}</p>
                      <p className="text-xs text-gray-500">Dr. {apt.doctorId?.firstName} {apt.doctorId?.lastName}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-300 truncate pr-4">
                        {apt.notes || 'No notes'}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-colors shadow-sm">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> records
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm">
                  {pagination.page}
                </button>
                <button 
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors disabled:opacity-50"
                >
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
