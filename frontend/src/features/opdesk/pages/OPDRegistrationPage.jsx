import { useState, useEffect } from 'react';
import { Search, Bell, Clock, CheckCircle2, AlertCircle, Users, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { appointmentApi } from '../../../api/appointment.api';
import { adminApi } from '../../../api/admin.api';
import { patientApi } from '../../../api/patient.api';
import toast from 'react-hot-toast';

export default function OPDRegistrationPage() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState({ total: 0, waiting: 0, triage: 0, emergency: 0 });
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form states
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    phoneCode: '+91',
    phone: '',
    departmentId: '',
    doctorId: '',
    symptoms: ''
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchData();
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, queueRes, deptsRes, docsRes] = await Promise.all([
        appointmentApi.getStats(),
        appointmentApi.getDoctorQueue({}), // Fetches all today's queue
        adminApi.getDepartments({ limit: 100 }),
        adminApi.getDoctors({ limit: 100 })
      ]);
      setStats(statsRes.data.data || { total: 0, waiting: 0, triage: 0, emergency: 0 });
      const activeQueue = queueRes.data.data || [];
      setQueue(activeQueue);
      if (activeQueue.length > 0 && !selectedPatient) setSelectedPatient(activeQueue[0]);

      setDepartments(deptsRes.data.data.docs || []);
      setDoctors(docsRes.data.data.docs || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    try {
      if (!formData.fullName || !formData.age || !formData.gender || !formData.phone || !formData.departmentId || !formData.doctorId) {
        toast.error('Please fill all mandatory fields (Name, Age, Gender, Phone, Department, Doctor)');
        return;
      }
      setLoading(true);

      // Split name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'N/A';

      // Convert age to DOB
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - parseInt(formData.age, 10));

      const patientPayload = {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth.toISOString(),
        gender: formData.gender.toLowerCase(),
        phone: formData.phoneCode.replace('+', '') + formData.phone,
      };

      // 1. Create Patient
      const patientRes = await patientApi.registerPatient(patientPayload);
      const patientId = patientRes.data.data._id;

      // 2. Generate Token
      const appointmentPayload = {
        patientId,
        doctorId: formData.doctorId,
        departmentId: formData.departmentId,
        notes: formData.symptoms
      };
      await appointmentApi.generateToken(appointmentPayload);

      toast.success('Patient Registered & Token Generated!');
      setFormData({ fullName: '', age: '', gender: '', phoneCode: '+91', phone: '', departmentId: '', doctorId: '', symptoms: '' });
      fetchData(); // Refresh queue
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'triage': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'waiting': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'in-progress': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-gray-950 font-sans">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex xl:flex-row flex-col gap-6 h-full max-w-[1600px] mx-auto">
          
          {/* Left Column: Queue */}
          <div className="xl:w-[320px] w-full shrink-0 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current OP List</h2>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md uppercase tracking-wider border border-blue-100 dark:border-blue-800/30">
                TOKEN SORTED
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-8">
              {queue.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No patients in queue</div>
              ) : (
                queue.map((item) => {
                  const isActive = selectedPatient?._id === item._id;
                  const statusStyle = getStatusStyle(item.status);
                  
                  return (
                    <div 
                      key={item._id}
                      onClick={() => setSelectedPatient(item)}
                      className={`p-4 rounded-2xl relative cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-white dark:bg-gray-900 shadow-md border-2 border-blue-500' 
                          : 'bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-200 hover:shadow-md group'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute -top-2 right-3 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-bold text-sm ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors'}`}>
                            {item.patientId?.firstName} {item.patientId?.lastName}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {item.patientId?.age || '?'} Yrs • Token #{item.tokenNumber}
                          </p>
                        </div>
                        <span className={`text-xl font-black ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-blue-600'}`}>
                          #{item.tokenNumber}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                        <span className="text-[10px]">📞</span> {item.patientId?.phone || 'N/A'}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                          <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-[8px]">📍</span> 
                          {item.departmentId?.name || 'General'}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-1 border rounded uppercase tracking-wider ${statusStyle}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
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

            <div className="bg-white dark:bg-gray-900 flex-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 xl:p-8 flex flex-col">
              
              <div className="mb-8 relative">
                <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-blue-500 flex items-center justify-center text-[8px]">✓</span>
                  PATIENT IDENTIFICATION (ABHA/NDHM)
                </label>
                <div className="flex gap-3">
                  <input type="text" placeholder="Enter ABHA / Aadhaar Number" className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400" />
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors text-sm whitespace-nowrap">
                    <Search className="w-4 h-4" strokeWidth={3} /> Fetch Details
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OR MANUAL ENTRY</span>
                <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700"></div>
              </div>

              <div className="space-y-5 flex-1">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 xl:col-span-8">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">FULL NAME</label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Patient Name" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" />
                  </div>
                  <div className="col-span-6 xl:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">AGE</label>
                    <input name="age" value={formData.age} onChange={handleInputChange} type="number" placeholder="Age" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400" />
                  </div>
                  <div className="col-span-6 xl:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">GENDER</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-500">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">MOBILE NUMBER</label>
                    <div className="flex gap-2">
                      <input name="phoneCode" value={formData.phoneCode} onChange={handleInputChange} type="text" className="w-16 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2.5 text-sm text-center outline-none font-medium" />
                      <input name="phone" value={formData.phone} onChange={handleInputChange} type="text" placeholder="1234567890" className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">ASSIGNED DEPARTMENT</label>
                    <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700">
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">DOCTOR</label>
                    <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700">
                      <option value="">Select Doctor</option>
                      {doctors.filter(doc => !formData.departmentId || doc.departmentId?._id === formData.departmentId).map(d => (
                        <option key={d._id} value={d.userId?._id || d._id}>{d.userId?.firstName} {d.userId?.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CHIEF SYMPTOMS & REASON</label>
                    <button className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 hover:underline"><Clock className="w-3 h-3"/> HISTORY</button>
                  </div>
                  <textarea name="symptoms" value={formData.symptoms} onChange={handleInputChange} rows="3" placeholder="Describe symptoms briefly..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder-gray-400"></textarea>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button onClick={handleRegister} disabled={loading} className="w-full bg-[#1da1f2] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wider uppercase shadow-lg shadow-blue-500/30 disabled:opacity-50">
                  {loading ? 'GENERATING...' : 'CONFIRM & GENERATE TOKEN'}
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-xs flex items-center justify-center gap-2 shadow-sm">
                     Save Draft
                  </button>
                  <button className="flex-1 bg-blue-50 border border-blue-100 text-blue-600 font-bold py-2.5 rounded-xl hover:bg-blue-100 transition-colors text-xs flex items-center justify-center gap-2 shadow-sm">
                    🖨️ Print Ticket
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Stats & Timeline */}
          <div className="xl:w-[280px] w-full shrink-0 flex flex-col space-y-6">
            
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2 relative">
                  <Users className="w-4 h-4"/>
                </div>
                <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">TODAY PATIENTS</h3>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</span>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2 relative">
                  <Zap className="w-4 h-4"/>
                </div>
                <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">REMAINING</h3>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.waiting + stats.triage}</span>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 relative">
                  <Clock className="w-4 h-4"/>
                </div>
                <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">AVG WAIT</h3>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{Math.max(stats.waiting * 15, 0)}m</span>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between items-center text-center hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2 relative">
                  <AlertCircle className="w-4 h-4"/>
                </div>
                <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">EMERGENCY</h3>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.emergency}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 flex-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col relative overflow-hidden">
              <h3 className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-2 text-center">PRESENT PATIENT DETAILS</h3>
              <h2 className="text-[13px] font-bold text-gray-900 dark:text-white text-center mb-8 pb-5 border-b border-gray-100">
                {selectedPatient ? `Token #${selectedPatient.tokenNumber} — ${selectedPatient.patientId?.firstName} ${selectedPatient.patientId?.lastName}` : 'No patient selected'}
              </h2>

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
