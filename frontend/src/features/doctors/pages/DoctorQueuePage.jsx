import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';
import { appointmentApi } from '../../../api/appointment.api';
import { consultationApi } from '../../../api/consultation.api';
import { prescriptionApi } from '../../../api/prescription.api';
import { vitalsApi } from '../../../api/vitals.api';
import { adminApi } from '../../../api/admin.api'; 
import PrescriptionPrint from './PrescriptionPrint';
import toast from 'react-hot-toast';

export default function DoctorQueuePage() {
  const socket = useSocket();
  const { authState } = useAuth();
  
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Data for current consultation
  const [vitals, setVitals] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Consultation State
  const [consultationId, setConsultationId] = useState(null);
  const [consultation, setConsultation] = useState({
    subjective: '',
    objective: '',
    assessment: '', 
    clinicalNotes: ''
  });

  // Prescription State
  const [medicines, setMedicines] = useState([]);
  const [medInput, setMedInput] = useState({ name: '', dosage: '', frequency: '1-0-1', duration: '5 Days', advice: 'After Food' });
  const [labTests, setLabTests] = useState('');
  const [radiology, setRadiology] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  // Print Mode
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef(null);

  // Transfer State
  const [showTransfer, setShowTransfer] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [transferData, setTransferData] = useState({ departmentId: '', doctorId: '' });

  const doctorId = authState?.user?.id; 

  useEffect(() => {
    if (doctorId) {
      fetchQueue();
      fetchDepartments();
    }
  }, [doctorId]);

  useEffect(() => {
    if (socket && doctorId) {
      socket.on('queue:updated', () => fetchQueue());
      return () => socket.off('queue:updated');
    }
  }, [socket, doctorId]);

  const fetchQueue = async () => {
    try {
      const { data } = await appointmentApi.getDoctorQueue(doctorId, null, 'active');
      setQueue(data.data || []);
    } catch (err) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await adminApi.getDepartments();
      setDepartments(data.data || []);
    } catch (err) {}
  };

  const currentPatient = queue.find(q => q.status === 'in-progress');
  const waitingPatients = queue.filter(q => q.status === 'waiting');
  const completedCount = queue.filter(q => q.status === 'completed').length;
  const skippedCount = queue.filter(q => q.status === 'skipped').length;

  useEffect(() => {
    if (currentPatient) {
      loadPatientData(currentPatient);
    } else {
      resetWorkspace();
    }
  }, [currentPatient]);

  const resetWorkspace = () => {
    setVitals(null);
    setHistory([]);
    setConsultationId(null);
    setConsultation({ subjective: '', objective: '', assessment: '', clinicalNotes: '' });
    setMedicines([]);
    setLabTests('');
    setRadiology('');
    setShowPrint(false);
  };

  const loadPatientData = async (appointment) => {
    try {
      // Load vitals
      const vitalsRes = await vitalsApi.getVitalsByAppointment(appointment._id);
      setVitals(vitalsRes.data.data);
      
      // Load history
      const histRes = await consultationApi.getPatientHistory(appointment.patientId._id);
      setHistory(histRes.data.data || []);
      
      // Load existing consultation 
      const consRes = await consultationApi.getConsultation(appointment._id);
      if (consRes.data.data) {
        const c = consRes.data.data;
        setConsultationId(c._id);
        setConsultation({
          subjective: c.subjective || '',
          objective: c.objective || '',
          assessment: c.assessment ? c.assessment.join(', ') : '',
          clinicalNotes: c.clinicalNotes || ''
        });

        // Load prescription if exists
        const rxRes = await prescriptionApi.getPrescription(c._id);
        if (rxRes.data.data) {
          const rx = rxRes.data.data;
          setMedicines(rx.medicines || []);
          setLabTests(rx.labTests ? rx.labTests.join(', ') : '');
          setRadiology(rx.radiology ? rx.radiology.join(', ') : '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      fetchQueue();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const searchMeds = async (q) => {
    setMedInput({ ...medInput, name: q });
    if (q.length > 2) {
      const { data } = await prescriptionApi.searchMedicines(q);
      setSuggestions(data.data);
    } else {
      setSuggestions([]);
    }
  };

  const addMedicine = () => {
    if (!medInput.name || !medInput.dosage) return toast.error('Name and Dosage required');
    setMedicines([...medicines, medInput]);
    setMedInput({ name: '', dosage: '', frequency: '1-0-1', duration: '5 Days', advice: 'After Food' });
    setSuggestions([]);
  };

  const removeMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleSaveAll = async (isCompleted = false) => {
    if (!currentPatient) return;
    try {
      // 1. Save Consultation
      const consPayload = {
        appointmentId: currentPatient._id,
        patientId: currentPatient.patientId._id,
        subjective: consultation.subjective,
        objective: consultation.objective,
        assessment: consultation.assessment.split(',').map(s => s.trim()),
        clinicalNotes: consultation.clinicalNotes,
        isCompleted
      };
      
      const consRes = await consultationApi.saveConsultation(consPayload);
      const savedConsultationId = consRes.data.data._id;
      setConsultationId(savedConsultationId);

      // 2. Save Prescription
      if (medicines.length > 0 || labTests || radiology) {
        await prescriptionApi.savePrescription({
          consultationId: savedConsultationId,
          appointmentId: currentPatient._id,
          patientId: currentPatient.patientId._id,
          medicines,
          labTests: labTests.split(',').map(s => s.trim()).filter(Boolean),
          radiology: radiology.split(',').map(s => s.trim()).filter(Boolean),
          isDigitallySigned: isCompleted // Automatically sign if completed
        });
      }
      
      if (isCompleted) {
        toast.success('Consultation Completed & Signed!');
        setShowPrint(true);
      } else {
        toast.success('Draft saved');
      }
    } catch (err) {
      toast.error('Failed to save data');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const closePrint = () => {
    setShowPrint(false);
    fetchQueue(); // refresh queue to remove completed patient from view
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4 h-[calc(100vh-80px)] flex flex-col print:hidden">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">EMR & E-Prescription</h1>
          <p className="text-gray-500">Doctor Consultation Workspace</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-600">{waitingPatients.length}</span>
            <span className="text-xs text-gray-500 uppercase font-bold">Waiting</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-green-600">{completedCount}</span>
            <span className="text-xs text-gray-500 uppercase font-bold">Completed</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Sidebar: Queue */}
        <div className="w-80 flex flex-col gap-4 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold">Waiting List</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {waitingPatients.map((q) => (
                <div key={q._id} className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${q.priority === 'emergency' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {q.tokenNumber}
                      </span>
                      <span className="font-bold text-gray-900 text-sm truncate">{q.patientId?.firstName} {q.patientId?.lastName}</span>
                    </div>
                  </div>
                  {!currentPatient && (
                    <button onClick={() => handleUpdateStatus(q._id, 'in-progress')} className="btn-secondary w-full py-1 text-xs">Call Patient</button>
                  )}
                </div>
              ))}
              {waitingPatients.length === 0 && <div className="text-center text-gray-400 mt-4 text-sm">Queue empty</div>}
            </div>
          </div>
        </div>

        {/* Main EMR Pane */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
          {currentPatient ? (
            <>
              {/* Patient Banner */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-primary-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentPatient.patientId?.firstName} {currentPatient.patientId?.lastName}
                  </h2>
                  <div className="text-sm text-gray-600 flex gap-4 mt-1">
                    <span>UHID: {currentPatient.patientId?.uhid}</span>
                    <span>{currentPatient.patientId?.gender} • {currentPatient.patientId?.age} yrs</span>
                    {vitals?.allergies && <span className="text-red-500 font-bold">Allergies: {vitals.allergies}</span>}
                  </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm font-black text-xl text-primary-600">
                  Token {currentPatient.tokenNumber}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
                
                {/* Center: Clinical Notes & Rx */}
                <div className="flex-1 space-y-6">
                  {/* Diagnosis */}
                  <div>
                    <label className="label font-bold text-gray-700">Diagnosis (ICD / Text)</label>
                    <input 
                      type="text"
                      className="input font-semibold text-lg border-primary-300 bg-primary-50 focus:bg-white" 
                      placeholder="e.g. Acute Viral Pharyngitis"
                      value={consultation.assessment}
                      onChange={e => setConsultation({...consultation, assessment: e.target.value})}
                    />
                  </div>

                  {/* Prescription Builder */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold flex justify-between items-center">
                      <span>Rx - Medicines</span>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Add Medicine Row */}
                      <div className="flex gap-2 items-end relative">
                        <div className="flex-1 relative">
                          <label className="text-xs font-bold text-gray-500 uppercase">Medicine</label>
                          <input 
                            type="text" className="input" placeholder="Search drug..." 
                            value={medInput.name} onChange={e => searchMeds(e.target.value)} 
                          />
                          {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-10 max-h-48 overflow-y-auto">
                              {suggestions.map((s, i) => (
                                <div key={i} className="p-2 hover:bg-primary-50 cursor-pointer" onClick={() => { setMedInput({...medInput, name: s}); setSuggestions([]); }}>
                                  {s}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="w-24">
                          <label className="text-xs font-bold text-gray-500 uppercase">Dose</label>
                          <input type="text" className="input" placeholder="500mg" value={medInput.dosage} onChange={e => setMedInput({...medInput, dosage: e.target.value})} />
                        </div>
                        <div className="w-24">
                          <label className="text-xs font-bold text-gray-500 uppercase">Freq</label>
                          <select className="input px-1" value={medInput.frequency} onChange={e => setMedInput({...medInput, frequency: e.target.value})}>
                            <option>1-0-1</option><option>1-1-1</option><option>0-0-1</option><option>SOS</option>
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="text-xs font-bold text-gray-500 uppercase">Days</label>
                          <input type="text" className="input" placeholder="5 Days" value={medInput.duration} onChange={e => setMedInput({...medInput, duration: e.target.value})} />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Advice</label>
                          <input type="text" className="input" placeholder="After food" value={medInput.advice} onChange={e => setMedInput({...medInput, advice: e.target.value})} />
                        </div>
                        <button onClick={addMedicine} className="btn-secondary h-10 px-4">+</button>
                      </div>

                      {/* Med List */}
                      {medicines.length > 0 && (
                        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                          <thead className="bg-gray-50 text-gray-500">
                            <tr>
                              <th className="p-2 text-left">Medicine</th>
                              <th className="p-2">Dose</th>
                              <th className="p-2">Freq</th>
                              <th className="p-2">Days</th>
                              <th className="p-2 text-left">Advice</th>
                              <th className="p-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {medicines.map((m, i) => (
                              <tr key={i} className="border-t border-gray-100">
                                <td className="p-2 font-bold">{m.name}</td>
                                <td className="p-2 text-center">{m.dosage}</td>
                                <td className="p-2 text-center">{m.frequency}</td>
                                <td className="p-2 text-center">{m.duration}</td>
                                <td className="p-2">{m.advice}</td>
                                <td className="p-2 text-center text-red-500 cursor-pointer" onClick={() => removeMedicine(i)}>✕</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Investigations */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label font-bold text-gray-700">Lab Tests</label>
                      <input type="text" className="input" placeholder="e.g. CBC, HbA1c (comma separated)" value={labTests} onChange={e => setLabTests(e.target.value)} />
                    </div>
                    <div>
                      <label className="label font-bold text-gray-700">Radiology</label>
                      <input type="text" className="input" placeholder="e.g. Chest X-Ray PA View" value={radiology} onChange={e => setRadiology(e.target.value)} />
                    </div>
                  </div>

                  {/* SOAP Notes Collapsible/Simple */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label text-gray-500 text-xs">Subjective (Notes)</label>
                      <textarea className="input min-h-[60px] text-sm" value={consultation.subjective} onChange={e => setConsultation({...consultation, subjective: e.target.value})} />
                    </div>
                    <div>
                      <label className="label text-gray-500 text-xs">Objective (Findings)</label>
                      <textarea className="input min-h-[60px] text-sm" value={consultation.objective} onChange={e => setConsultation({...consultation, objective: e.target.value})} />
                    </div>
                  </div>

                </div>

                {/* Right: Vitals & History Pane */}
                <div className="w-72 flex flex-col gap-4 shrink-0 border-l border-gray-100 pl-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm">
                    <h3 className="font-bold mb-2">Triage Vitals</h3>
                    {vitals ? (
                      <div className="grid grid-cols-2 gap-y-1">
                        <div className="text-gray-500">BP</div><div className="font-semibold">{vitals.bpSystolic}/{vitals.bpDiastolic}</div>
                        <div className="text-gray-500">Temp</div><div className="font-semibold">{vitals.temperature}</div>
                        <div className="text-gray-500">Pulse</div><div className="font-semibold">{vitals.pulse}</div>
                        <div className="text-gray-500">SpO2</div><div className="font-semibold">{vitals.spo2}%</div>
                        <div className="text-gray-500">BMI</div><div className="font-semibold">{vitals.bmi}</div>
                      </div>
                    ) : <span className="text-gray-400">No vitals</span>}
                  </div>

                  <div className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-200 overflow-y-auto">
                    <h3 className="font-bold mb-2 text-sm">Past Visits</h3>
                    <div className="space-y-2">
                      {history.map(h => (
                        <div key={h._id} className="p-2 bg-white border border-gray-200 rounded-lg text-xs">
                          <div className="font-bold text-primary-600">{new Date(h.appointmentId?.date).toLocaleDateString()}</div>
                          <div className="text-gray-700 truncate">{h.assessment.join(', ')}</div>
                        </div>
                      ))}
                      {history.length === 0 && <div className="text-xs text-gray-400">No history</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <div className="flex gap-2">
                  <button onClick={() => setShowTransfer(true)} className="btn-secondary">Transfer</button>
                  <button onClick={() => handleUpdateStatus(currentPatient._id, 'skipped')} className="btn-secondary text-red-600">Skip</button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleSaveAll(false)} className="btn-secondary">Save Draft</button>
                  <button onClick={() => handleSaveAll(true)} className="btn-primary px-8 font-bold text-lg flex items-center gap-2">
                    <span>Sign & Complete</span>
                    <span className="text-xl">✍️</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <span className="text-6xl mb-4">🩺</span>
              <p>Select a patient to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Print Modal overlay */}
      {showPrint && currentPatient && (
        <div className="fixed inset-0 bg-gray-900/90 z-50 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-[800px] max-w-full">
            <div className="p-4 bg-gray-100 border-b flex justify-between items-center print:hidden">
              <h2 className="font-bold text-lg">Print / PDF Preview</h2>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn-primary">🖨️ Print to PDF</button>
                <button onClick={closePrint} className="btn-secondary">Close & Next</button>
              </div>
            </div>
            
            <div className="p-8 bg-white overflow-y-auto" style={{ maxHeight: '80vh' }}>
              <div ref={printRef} className="print-content">
                <PrescriptionPrint 
                  patient={currentPatient.patientId} 
                  doctor={currentPatient.doctorId}
                  vitals={vitals}
                  diagnosis={consultation.assessment}
                  medicines={medicines}
                  labTests={labTests}
                  radiology={radiology}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
