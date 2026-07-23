import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { appointmentApi } from '../../../api/appointment.api';
import { vitalsApi } from '../../../api/vitals.api';
import toast from 'react-hot-toast';

export default function TriageQueuePage() {
  const socket = useSocket();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [vitals, setVitals] = useState({
    height: '', weight: '', bmi: '',
    bpSystolic: '', bpDiastolic: '',
    temperature: '', pulse: '', spo2: '', respiration: '', sugar: '',
    painScore: '', allergies: '', notes: ''
  });

  useEffect(() => {
    fetchTriageQueue();
  }, []);

  // Socket Listener for new tokens
  useEffect(() => {
    if (socket) {
      socket.on('queue:updated', () => {
        fetchTriageQueue();
      });
      return () => {
        socket.off('queue:updated');
      };
    }
  }, [socket]);

  // Auto-calculate BMI
  useEffect(() => {
    if (vitals.height && vitals.weight) {
      const hMeters = parseFloat(vitals.height) / 100;
      const wKg = parseFloat(vitals.weight);
      if (hMeters > 0 && wKg > 0) {
        const calculatedBmi = (wKg / (hMeters * hMeters)).toFixed(1);
        setVitals(v => ({ ...v, bmi: calculatedBmi }));
      }
    } else {
      setVitals(v => ({ ...v, bmi: '' }));
    }
  }, [vitals.height, vitals.weight]);

  const fetchTriageQueue = async () => {
    try {
      setLoading(true);
      const { data } = await appointmentApi.getDoctorQueue(null, null, 'triage'); 
      setQueue(data.data || []);
    } catch (err) {
      toast.error('Failed to load triage queue');
    } finally {
      setLoading(false);
    }
  };

  // Wait, I need to fix the `getDoctorQueue` controller to allow docId to be null for triage
  // I will do that via a quick patch.

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitals(v => ({ ...v, [name]: value }));
  };

  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setSubmitting(true);
    try {
      const payload = {
        appointmentId: selectedPatient._id,
        patientId: selectedPatient.patientId._id,
        ...vitals,
      };
      
      // Clean up empty strings
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') delete payload[key];
      });

      await vitalsApi.saveVitals(payload);
      toast.success('Vitals saved! Patient moved to Doctor Queue.');
      
      setSelectedPatient(null);
      setVitals({
        height: '', weight: '', bmi: '', bpSystolic: '', bpDiastolic: '',
        temperature: '', pulse: '', spo2: '', respiration: '', sugar: '',
        painScore: '', allergies: '', notes: ''
      });
      
      fetchTriageQueue();
    } catch (err) {
      toast.error('Failed to save vitals');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nursing Triage</h1>
          <p className="text-gray-500">Record patient vitals before doctor consultation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Triage Queue List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-[700px] flex flex-col">
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold">Waiting for Vitals</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {queue.map(q => (
              <div 
                key={q._id} 
                onClick={() => setSelectedPatient(q)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedPatient?._id === q._id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:border-primary-300'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    {q.tokenNumber}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{q.patientId?.firstName} {q.patientId?.lastName}</div>
                    <div className="text-xs text-gray-500">Dr. {q.doctorId?.lastName} • {q.departmentId?.name}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {queue.length === 0 && !loading && (
              <div className="text-center text-gray-400 mt-10">No patients waiting for triage</div>
            )}
          </div>
        </div>

        {/* Vital Screening Form */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Record Vitals</h2>
                  <div className="text-primary-600 font-medium mt-1">
                    {selectedPatient.patientId.firstName} {selectedPatient.patientId.lastName} (Token {selectedPatient.tokenNumber})
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-gray-600">✕ Close</button>
              </div>

              <form onSubmit={handleSubmitVitals} className="space-y-6">
                {/* Physical */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="label">Height (cm)</label>
                    <input type="number" step="0.1" name="height" value={vitals.height} onChange={handleVitalChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Weight (kg)</label>
                    <input type="number" step="0.1" name="weight" value={vitals.weight} onChange={handleVitalChange} className="input" />
                  </div>
                  <div>
                    <label className="label">BMI</label>
                    <input type="text" readOnly value={vitals.bmi} className="input bg-gray-50 font-bold" />
                  </div>
                </div>

                {/* Cardiovasc */}
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <label className="label">BP Systolic</label>
                    <input type="number" name="bpSystolic" value={vitals.bpSystolic} onChange={handleVitalChange} className="input" placeholder="e.g. 120" />
                  </div>
                  <div>
                    <label className="label">BP Diastolic</label>
                    <input type="number" name="bpDiastolic" value={vitals.bpDiastolic} onChange={handleVitalChange} className="input" placeholder="e.g. 80" />
                  </div>
                  <div>
                    <label className="label">Pulse (bpm)</label>
                    <input type="number" name="pulse" value={vitals.pulse} onChange={handleVitalChange} className="input" />
                  </div>
                  <div>
                    <label className="label">SpO2 (%)</label>
                    <input type="number" name="spo2" value={vitals.spo2} onChange={handleVitalChange} className="input" />
                  </div>
                </div>

                {/* Other */}
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <label className="label">Temp (°F/°C)</label>
                    <input type="number" step="0.1" name="temperature" value={vitals.temperature} onChange={handleVitalChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Respiration (/min)</label>
                    <input type="number" name="respiration" value={vitals.respiration} onChange={handleVitalChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Sugar (mg/dL)</label>
                    <input type="number" name="sugar" value={vitals.sugar} onChange={handleVitalChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Pain (0-10)</label>
                    <input type="number" min="0" max="10" name="painScore" value={vitals.painScore} onChange={handleVitalChange} className="input" />
                  </div>
                </div>

                <div>
                  <label className="label">Allergies</label>
                  <input type="text" name="allergies" value={vitals.allergies} onChange={handleVitalChange} className="input" placeholder="E.g. Penicillin, Peanuts" />
                </div>
                
                <div>
                  <label className="label">Triage Notes</label>
                  <textarea name="notes" value={vitals.notes} onChange={handleVitalChange} className="input min-h-[80px]" placeholder="Any observation notes..." />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-lg shadow-lg">
                    {submitting ? 'Saving...' : 'Submit Vitals & Move to Doctor'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400 flex-col">
              <span className="text-5xl mb-4">🩺</span>
              <p>Select a patient from the queue to record vitals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
