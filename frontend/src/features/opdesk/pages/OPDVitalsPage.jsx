import { useState, useEffect } from 'react';
import { Search, Bell, Clock, Activity, HeartPulse, Thermometer, Droplets, Wind, Scale, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { appointmentApi } from '../../../api/appointment.api';
import { vitalsApi } from '../../../api/vitals.api';
import toast from 'react-hot-toast';

export default function OPDVitalsPage() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  // Vitals form state
  const [vitals, setVitals] = useState({
    bp: '', // e.g. 120/80
    pulse: '',
    temperature: '',
    spo2: '',
    weight: '',
    height: ''
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchQueue();
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await appointmentApi.getDoctorQueue({ statusFilter: 'triage' });
      const triageQueue = data.data || [];
      setQueue(triageQueue);
      if (triageQueue.length > 0) setSelectedPatient(triageQueue[0]);
    } catch (err) {
      console.error('Failed to load triage queue', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveVitals = async () => {
    if (!selectedPatient) return;
    
    try {
      setLoading(true);
      
      let bpSystolic, bpDiastolic;
      if (vitals.bp && vitals.bp.includes('/')) {
        const [sys, dia] = vitals.bp.split('/');
        bpSystolic = parseInt(sys, 10);
        bpDiastolic = parseInt(dia, 10);
      }

      const payload = {
        appointmentId: selectedPatient._id,
        patientId: selectedPatient.patientId._id,
        bpSystolic,
        bpDiastolic,
        pulse: vitals.pulse ? parseInt(vitals.pulse, 10) : undefined,
        temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
        spo2: vitals.spo2 ? parseInt(vitals.spo2, 10) : undefined,
        weight: vitals.weight ? parseFloat(vitals.weight) : undefined,
        height: vitals.height ? parseFloat(vitals.height) : undefined,
      };

      // 1. Save Vitals
      await vitalsApi.saveVitals(payload);

      // 2. Update status to waiting (sends to doctor's queue)
      await appointmentApi.updateStatus(selectedPatient._id, 'waiting', '');

      toast.success('Vitals saved and patient moved to waiting queue');
      
      // Reset form and queue
      setVitals({ bp: '', pulse: '', temperature: '', spo2: '', weight: '', height: '' });
      setSelectedPatient(null);
      fetchQueue();
    } catch (err) {
      console.error('Error saving vitals:', err);
      toast.error('Failed to save vitals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-gray-950 font-sans">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex xl:flex-row flex-col gap-6 h-full max-w-[1600px] mx-auto">
          
          {/* Left Column: Triage Queue */}
          <div className="xl:w-[320px] w-full shrink-0 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Vitals Queue</h2>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-md uppercase tracking-wider border border-amber-100 dark:border-amber-800/30">
                PENDING TRIAGE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-8">
              {queue.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No patients in triage queue</div>
              ) : (
                queue.map((item) => {
                  const isActive = selectedPatient?._id === item._id;
                  const isEmergency = item.priority === 'emergency';
                  
                  return (
                    <div 
                      key={item._id}
                      onClick={() => setSelectedPatient(item)}
                      className={`p-4 rounded-2xl relative cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-white dark:bg-gray-900 shadow-md border-2 border-blue-500' 
                          : isEmergency 
                            ? 'bg-white dark:bg-gray-900 shadow-sm border border-red-100 hover:border-red-300 bg-red-50/10'
                            : 'bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-200'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute -top-2 right-3 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <Activity className="w-3 h-3" />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-bold text-sm ${isEmergency ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {item.patientId?.firstName} {item.patientId?.lastName}
                          </h3>
                          <p className={`text-[11px] font-medium ${isEmergency ? 'text-red-400' : 'text-gray-500'}`}>
                            {item.patientId?.age || '?'} Yrs • {item.patientId?.gender || 'Unknown'}
                          </p>
                        </div>
                        <span className={`text-xl font-black ${isActive ? 'text-blue-900 dark:text-blue-100' : isEmergency ? 'text-red-500' : 'text-blue-600'}`}>
                          #{item.tokenNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                          <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> 
                          {item.departmentId?.name || 'General'}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 ${
                          isEmergency 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {isEmergency && <AlertTriangle className="w-3 h-3"/>}
                          {isEmergency ? 'CRITICAL' : 'WAITING'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Vitals Entry</h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">NURSE STATION</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 flex-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 xl:p-8 flex flex-col">
              
              {/* Patient Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {selectedPatient?.patientId?.firstName?.charAt(0) || 'P'}
                    {selectedPatient?.patientId?.lastName?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedPatient ? `Token #${selectedPatient.tokenNumber} — ${selectedPatient.patientId?.firstName} ${selectedPatient.patientId?.lastName}` : 'No Patient Selected'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedPatient?.patientId?.age || '?'} Yrs • {selectedPatient?.patientId?.gender || 'Unknown'} • {selectedPatient?.departmentId?.name || 'OPD'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CHIEF COMPLAINT</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-300">{selectedPatient?.notes || 'Not specified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
                
                {/* Blood Pressure */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><HeartPulse className="w-3.5 h-3.5" /></div>
                      BLOOD PRESSURE
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <input name="bp" value={vitals.bp} onChange={handleInputChange} type="text" placeholder="120/80" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-base font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                    <span className="text-[10px] font-bold text-gray-400 pb-2.5">mmHg</span>
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><Activity className="w-3.5 h-3.5" /></div>
                      HEART RATE
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <input name="pulse" value={vitals.pulse} onChange={handleInputChange} type="number" placeholder="72" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-base font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                    <span className="text-[10px] font-bold text-gray-400 pb-2.5">BPM</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-3">
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
                    <input name="temperature" value={vitals.temperature} onChange={handleInputChange} type="number" step="0.1" placeholder="98.6" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-base font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                  </div>
                </div>

                {/* SpO2 */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center"><Wind className="w-3.5 h-3.5" /></div>
                      SpO2
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <input name="spo2" value={vitals.spo2} onChange={handleInputChange} type="number" placeholder="99" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-base font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                    <span className="text-[10px] font-bold text-gray-400 pb-2.5">%</span>
                  </div>
                </div>

                {/* Weight / Height */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors xl:col-span-2">
                   <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><Scale className="w-3.5 h-3.5" /></div>
                      PHYSICAL STATS
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-end gap-2">
                      <input name="weight" value={vitals.weight} onChange={handleInputChange} type="number" placeholder="Weight" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                      <span className="text-[10px] font-bold text-gray-400 pb-2.5">kg</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <input name="height" value={vitals.height} onChange={handleInputChange} type="number" placeholder="Height" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                      <span className="text-[10px] font-bold text-gray-400 pb-2.5">cm</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row gap-3">
                <button 
                  onClick={handleSaveVitals} 
                  disabled={loading || !selectedPatient} 
                  className="flex-1 bg-[#1da1f2] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wider uppercase shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> {loading ? 'SAVING...' : 'Save Vitals & Send to Doctor'}
                </button>
                <button className="xl:px-6 bg-white border border-red-200 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm">
                  <AlertTriangle className="w-4 h-4" /> Flag Critical
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: History & Alerts */}
          <div className="xl:w-[280px] w-full shrink-0 flex flex-col space-y-6">
            <div className="bg-white dark:bg-gray-900 flex-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col relative overflow-hidden">
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
