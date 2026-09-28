import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../../api/patient.api';
import { appointmentApi } from '../../../api/appointment.api';
import { doctorsApi } from '../../../api/doctors.api';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const VISIT_TYPES = ['walk-in', 'appointment', 'follow-up'];
const PRIORITIES = ['normal', 'emergency', 'vip'];

const STATUS_META = {
  triage:       { label: 'Triage',      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  waiting:      { label: 'Waiting',     color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  'in-progress':{ label: 'In Progress', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' },
  completed:    { label: 'Completed',   color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  cancelled:    { label: 'Cancelled',   color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  missed:       { label: 'Missed',      color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  hold:         { label: 'On Hold',     color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  skipped:      { label: 'Skipped',     color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300' },
  transferred:  { label: 'Transferred', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
};

const PRIORITY_META = {
  normal:    { label: 'Normal',    icon: '🟢' },
  emergency: { label: 'Emergency', icon: '🔴' },
  vip:       { label: 'VIP',       icon: '⭐' },
};

// ── Validators ────────────────────────────────────────────────────────────────
// ABHA: Ayushman Bharat Health Account — 14 digits, format XX-XXXX-XXXX-XXXX
function validateAbha(value) {
  if (!value) return null;
  const clean = value.replace(/-/g, '');
  if (!/^\d{14}$/.test(clean)) return 'ABHA must be exactly 14 digits';
  return null;
}

// Aadhaar: 12 digits with Verhoeff algorithm checksum (production-grade)
function validateAadhaar(value) {
  if (!value) return null;
  if (!/^\d{12}$/.test(value)) return 'Aadhaar must be exactly 12 digits';
  const mult = [
    [0,1,2,3,4,5,6,7,8,9],
    [1,2,3,4,0,6,7,8,9,5],
    [2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],
    [4,0,1,2,3,9,5,6,7,8],
    [5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],
    [7,6,5,9,8,2,1,0,4,3],
    [8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0],
  ];
  const perm = [
    [0,1,2,3,4,5,6,7,8,9],
    [1,5,7,6,2,8,3,0,9,4],
    [5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],
    [9,4,5,3,1,2,6,8,7,0],
    [4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],
    [7,0,4,6,9,1,3,2,5,8],
  ];
  const inv = [0,4,3,2,1,5,6,7,8,9];
  let c = 0;
  const digits = value.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = mult[c][perm[i % 8][digits[i]]];
  }
  if (inv[c] !== 0) return 'Invalid Aadhaar number (checksum mismatch)';
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatAbha(raw) {
  const clean = raw.replace(/\D/g, '').slice(0, 14);
  if (clean.length <= 2) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  if (clean.length <= 10) return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}-${clean.slice(10)}`;
}

function calcAge(dob) {
  if (!dob) return '—';
  return `${Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000))}y`;
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Registration Modal (3-step) ───────────────────────────────────────────────
function RegistrationModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'male', bloodGroup: '',
    phone: '', email: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    aadhaar: '', abha: '',
    emergencyContact: { name: '', relationship: '', phone: '' },
    insurance: { provider: '', policyNumber: '', validTill: '' },
    allergies: '', chronicConditions: '',
  });

  const setField = (name, value) => {
    setErrors(prev => ({ ...prev, [name.includes('.') ? name.split('.')[1] : name]: undefined }));
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setForm(f => ({ ...f, [section]: { ...f[section], [field]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const onChange = e => setField(e.target.name, e.target.value);
  const onAbhaChange = e => setField('abha', formatAbha(e.target.value));

  const validateStep1 = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.dateOfBirth) errs.dateOfBirth = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    else if (!/^[0-9+\-\s]{10,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (form.aadhaar) {
      const e = validateAadhaar(form.aadhaar.replace(/\D/g, ''));
      if (e) errs.aadhaar = e;
    }
    if (form.abha) {
      const e = validateAbha(form.abha);
      if (e) errs.abha = e;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) { setStep(2); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        aadhaar: form.aadhaar.replace(/\D/g, '') || undefined,
        abha: form.abha.replace(/-/g, '') || undefined,
        allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: form.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        insurance: { ...form.insurance, validTill: form.insurance.validTill || null },
      };
      if (!payload.aadhaar) delete payload.aadhaar;
      if (!payload.abha) delete payload.abha;
      if (!payload.email) delete payload.email;

      const { data } = await patientApi.registerPatient(payload);
      toast.success(`Patient registered! UHID: ${data.data.uhid}`);
      onSuccess(data.data);
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const STEPS = ['Personal Info', 'ID Verification', 'Medical History'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Patient Registration</h2>
            <p className="text-sm text-gray-500 mt-0.5">ABHA-compliant · UHID auto-generated on save</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-xl leading-none">×</button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className={`flex items-center gap-2 ${active || done ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                      {done ? '✓' : n}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${done ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input name="firstName" value={form.firstName} onChange={onChange} className={`input ${errors.firstName ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="Rajesh" />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input name="lastName" value={form.lastName} onChange={onChange} className={`input ${errors.lastName ? 'border-red-400 focus:ring-red-400' : ''}`} placeholder="Kumar" />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} max={new Date().toISOString().split('T')[0]} className={`input ${errors.dateOfBirth ? 'border-red-400' : ''}`} />
                  {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
                </div>
                <div>
                  <label className="label">Gender *</label>
                  <select name="gender" value={form.gender} onChange={onChange} className="input">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Mobile Number *</label>
                  <input type="tel" name="phone" value={form.phone} onChange={onChange} className={`input ${errors.phone ? 'border-red-400' : ''}`} placeholder="9876543210" maxLength={15} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="label">Blood Group</label>
                  <select name="bloodGroup" value={form.bloodGroup} onChange={onChange} className="input">
                    <option value="">— Unknown —</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input type="email" name="email" value={form.email} onChange={onChange} className="input" placeholder="patient@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input name="address.city" value={form.address.city} onChange={onChange} className="input" placeholder="Hyderabad" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input name="address.state" value={form.address.state} onChange={onChange} className="input" placeholder="Telangana" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Emergency Contact Name</label>
                  <input name="emergencyContact.name" value={form.emergencyContact.name} onChange={onChange} className="input" placeholder="Suresh Kumar" />
                </div>
                <div>
                  <label className="label">Emergency Contact Phone</label>
                  <input name="emergencyContact.phone" value={form.emergencyContact.phone} onChange={onChange} className="input" placeholder="9876543211" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: ID Verification */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">ABHA ID — Ayushman Bharat Health Account</h3>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1.5 space-y-1 list-disc list-inside">
                      <li>Exactly 14 digits, issued by NHA (National Health Authority)</li>
                      <li>Format: XX-XXXX-XXXX-XXXX (hyphens are auto-inserted)</li>
                      <li>Globally unique — links to ABDM-connected health records</li>
                      <li>Leave blank if patient does not have an ABHA number yet</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="label">
                  ABHA Number
                  <span className="ml-2 text-xs text-gray-400 font-normal">14-digit Health ID</span>
                </label>
                <input
                  value={form.abha}
                  onChange={onAbhaChange}
                  className={`input font-mono tracking-widest ${errors.abha ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="XX-XXXX-XXXX-XXXX"
                  maxLength={17}
                />
                {errors.abha && <p className="text-xs text-red-500 mt-1">⚠ {errors.abha}</p>}
                {!errors.abha && form.abha.replace(/-/g, '').length === 14 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Valid ABHA format</p>
                )}
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🆔</span>
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Aadhaar Number</h3>
                    <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1.5 space-y-1 list-disc list-inside">
                      <li>Exactly 12 digits with valid Verhoeff checksum</li>
                      <li>Stored encrypted at rest; only last 4 digits shown after save</li>
                      <li>Used for ABHA linking and identity verification</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Aadhaar Number</label>
                <input
                  name="aadhaar"
                  value={form.aadhaar}
                  onChange={e => setField('aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className={`input font-mono tracking-widest ${errors.aadhaar ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="XXXXXXXXXXXX"
                  maxLength={12}
                />
                {errors.aadhaar && <p className="text-xs text-red-500 mt-1">⚠ {errors.aadhaar}</p>}
                {!errors.aadhaar && form.aadhaar.length === 12 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Aadhaar checksum valid</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Insurance Provider</label>
                  <input name="insurance.provider" value={form.insurance.provider} onChange={onChange} className="input" placeholder="Star Health" />
                </div>
                <div>
                  <label className="label">Policy Number</label>
                  <input name="insurance.policyNumber" value={form.insurance.policyNumber} onChange={onChange} className="input" placeholder="SH-2024-XXXXXX" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Medical History + Summary */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="label">Known Allergies <span className="text-gray-400 font-normal text-xs">(comma-separated)</span></label>
                <textarea name="allergies" value={form.allergies} onChange={onChange} rows={3} className="input resize-none" placeholder="Penicillin, Aspirin, Peanuts…" />
              </div>
              <div>
                <label className="label">Chronic Conditions <span className="text-gray-400 font-normal text-xs">(comma-separated)</span></label>
                <textarea name="chronicConditions" value={form.chronicConditions} onChange={onChange} rows={3} className="input resize-none" placeholder="Type 2 Diabetes, Hypertension, Asthma…" />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">Registration Summary</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {[
                    ['Name', `${form.firstName} ${form.lastName}`],
                    ['DOB', form.dateOfBirth ? formatDate(form.dateOfBirth) : '—'],
                    ['Gender', form.gender],
                    ['Phone', form.phone],
                    ['Blood Group', form.bloodGroup || 'Unknown'],
                    ['ABHA', form.abha || 'Not provided'],
                    ['Aadhaar', form.aadhaar ? `XXXXXXXX${form.aadhaar.slice(-4)}` : 'Not provided'],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{k}</span>
                      <span className="text-gray-600 dark:text-gray-400 capitalize font-mono text-xs">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} className="btn-secondary">
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 3 ? (
            <button onClick={handleNext} className="btn-primary px-8">Continue →</button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="btn-primary px-8 min-w-[160px]">
              {saving
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering…</span>
                : 'Complete Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Token Issue Modal ─────────────────────────────────────────────────────────
function TokenModal({ patient, doctors, onClose, onSuccess }) {
  const [form, setForm] = useState({ doctorId: '', visitType: 'walk-in', priority: 'normal' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = e => {
    setErrors(p => ({ ...p, [e.target.name]: undefined }));
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!form.doctorId) errs.doctorId = 'Please select a doctor';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const doc = doctors.find(d => d._id === form.doctorId);
      const { data } = await appointmentApi.generateToken({
        patientId: patient._id,
        doctorId: form.doctorId,
        departmentId: doc?.departmentId,
        visitType: form.visitType,
        priority: form.priority,
      });
      const token = data.data?.tokenNumber ?? data.tokenNumber;
      toast.success(`Token #${token} issued for ${patient.firstName}!`);
      onSuccess();
    } catch (err) {
      toast.error(err?.message || 'Failed to generate token');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Issue OPD Token</h2>
            <p className="text-sm text-gray-500">{patient.firstName} {patient.lastName} · {patient.uhid}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Doctor *</label>
            <select name="doctorId" value={form.doctorId} onChange={onChange} className={`input ${errors.doctorId ? 'border-red-400' : ''}`}>
              <option value="">— Select Doctor —</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}{d.specialty ? ` · ${d.specialty}` : ''}</option>
              ))}
            </select>
            {errors.doctorId && <p className="text-xs text-red-500 mt-1">{errors.doctorId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Visit Type</label>
              <select name="visitType" value={form.visitType} onChange={onChange} className="input">
                {VISIT_TYPES.map(v => <option key={v} value={v}>{v.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select name="priority" value={form.priority} onChange={onChange} className="input">
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{PRIORITY_META[p].icon} {PRIORITY_META[p].label}</option>
                ))}
              </select>
            </div>
          </div>
          {form.priority === 'emergency' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              🚨 Emergency tokens are prioritized at the front of the queue regardless of token number.
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary px-8">
            {saving
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Issuing…</span>
              : 'Issue Token'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Queue Card ────────────────────────────────────────────────────────────────
function QueueCard({ appt, onUpdate, done }) {
  const patient = appt.patientId || {};
  const doctor  = appt.doctorId  || {};
  const sm = STATUS_META[appt.status] || STATUS_META.triage;
  const pm = PRIORITY_META[appt.priority] || PRIORITY_META.normal;
  const isActive = appt.status === 'in-progress';

  return (
    <div className={`rounded-xl border transition-all ${
      done ? 'opacity-55 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30'
      : isActive ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm'
      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-sm'
    }`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
              <span className="text-[9px] font-medium opacity-70">TKN</span>
              <span className="text-base leading-none">{appt.tokenNumber}</span>
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {patient.firstName} {patient.lastName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {patient.uhid} · Dr. {doctor.firstName} {doctor.lastName}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sm.color}`}>{sm.label}</span>
            <span className="text-[10px] text-gray-400">{pm.icon} {pm.label}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
          <span>Reg: {formatTime(appt.createdAt)}</span>
          {appt.estimatedTime && <span>Est: {formatTime(appt.estimatedTime)}</span>}
          {appt.timeIn && <span>In: {formatTime(appt.timeIn)}</span>}
        </div>

        {!done && (
          <div className="mt-2.5 flex gap-1.5 flex-wrap">
            {appt.status === 'triage' && (
              <button onClick={() => onUpdate(appt._id, 'waiting')} className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 font-medium transition-colors">
                → Waiting Room
              </button>
            )}
            {appt.status === 'waiting' && (
              <button onClick={() => onUpdate(appt._id, 'in-progress')} className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 font-medium transition-colors">
                📞 Call Patient
              </button>
            )}
            {appt.status === 'in-progress' && (
              <button onClick={() => onUpdate(appt._id, 'completed')} className="text-[10px] px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 font-medium transition-colors">
                ✓ Mark Complete
              </button>
            )}
            {['triage', 'waiting'].includes(appt.status) && (
              <button onClick={() => onUpdate(appt._id, 'hold')} className="text-[10px] px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 font-medium transition-colors">
                ⏸ Hold
              </button>
            )}
            {appt.status === 'hold' && (
              <button onClick={() => onUpdate(appt._id, 'waiting')} className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 font-medium transition-colors">
                ▶ Resume
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Queue Panel ───────────────────────────────────────────────────────────────
function TokenQueuePanel({ queue, loading, onRefresh, onStatusUpdate }) {
  const pending = queue.filter(a => ['triage', 'waiting', 'hold'].includes(a.status));
  const active  = queue.filter(a => a.status === 'in-progress');
  const done    = queue.filter(a => ['completed', 'cancelled', 'missed', 'skipped', 'transferred'].includes(a.status));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Today's OPD Queue</h3>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(new Date().toISOString())} · auto-refreshes every 30s</p>
        </div>
        <button onClick={onRefresh} title="Refresh queue" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Pending', count: pending.length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Active',  count: active.length,  color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Done',    count: done.length,    color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
            <div className={`text-xl font-bold ${color}`}>{count}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
            <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin" />
            <span className="text-sm">Loading queue…</span>
          </div>
        )}
        {!loading && queue.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm font-medium">No tokens issued today</p>
            <p className="text-xs mt-1 text-gray-400">Issue tokens from the patient table</p>
          </div>
        )}
        {/* Active first — most urgent */}
        {active.map(a => <QueueCard key={a._id} appt={a} onUpdate={onStatusUpdate} />)}
        {/* Pending */}
        {pending.map(a => <QueueCard key={a._id} appt={a} onUpdate={onStatusUpdate} />)}
        {/* Done (dimmed) */}
        {done.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Completed</p>
            {done.map(a => <QueueCard key={a._id} appt={a} onUpdate={onStatusUpdate} done />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PatientListPage() {
  const navigate = useNavigate();

  const [patients, setPatients]         = useState([]);
  const [patientTotal, setPatientTotal] = useState(0);
  const [patientPage, setPatientPage]   = useState(1);
  const [patientLoading, setPatientLoading] = useState(true);
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const searchTimer = useRef(null);

  const [queue, setQueue]               = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [doctors, setDoctors]           = useState([]);

  const [showRegister, setShowRegister] = useState(false);
  const [tokenTarget, setTokenTarget]   = useState(null);

  const PAGE_LIMIT = 15;

  // ── Data fetchers ─────────────────────────────────────────────────────────
  const fetchPatients = useCallback(async (page = 1, q = '') => {
    setPatientLoading(true);
    try {
      const params = { page, limit: PAGE_LIMIT };
      if (q) params.search = q;
      const { data } = await patientApi.getPatients(params);
      const r = data.data;
      setPatients(r.docs || []);
      setPatientTotal(r.total || 0);
      setPatientPage(r.page || 1);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setPatientLoading(false);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const { data } = await appointmentApi.getDoctorQueue({
        date: new Date().toISOString().split('T')[0],
      });
      setQueue(data.data || []);
    } catch {
      setQueue([]);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await doctorsApi.getAll({ limit: 100 });
      setDoctors(data.data?.docs || data.data || []);
    } catch {
      setDoctors([]);
    }
  }, []);

  useEffect(() => {
    fetchPatients(1, '');
    fetchQueue();
    fetchDoctors();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchPatients, fetchQueue, fetchDoctors]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearchChange = e => {
    const v = e.target.value;
    setSearchInput(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(v);
      fetchPatients(1, v);
    }, 400);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success(`Token moved to ${STATUS_META[status]?.label || status}`);
      fetchQueue();
    } catch (err) {
      toast.error(err?.message || 'Status update failed');
    }
  };

  const handleRegistered = newPatient => {
    setShowRegister(false);
    fetchPatients(1, search);
    setTokenTarget(newPatient); // prompt to issue token immediately
  };

  const handleTokenIssued = () => {
    setTokenTarget(null);
    fetchQueue();
  };

  const totalPages = Math.ceil(patientTotal / PAGE_LIMIT);
  const pendingCount = queue.filter(a => ['triage', 'waiting', 'hold'].includes(a.status)).length;

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {/* Page Header */}
      <div className="page-header mb-0 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {patientTotal > 0 ? `${patientTotal.toLocaleString()} registered patients` : 'No patients yet'}
            {' · '}
            <span className="font-medium text-amber-600 dark:text-amber-400">{pendingCount} pending tokens today</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/patients/lookup')} id="btn-patient-lookup" className="btn-secondary gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Lookup
          </button>
          <button onClick={() => setShowRegister(true)} id="btn-register-patient" className="btn-primary gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Patient
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="flex gap-5 flex-1 overflow-hidden pt-4 min-h-0">

        {/* ── Patient Table (left) ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="mb-3 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="input-patient-search"
              value={searchInput}
              onChange={handleSearchChange}
              className="input pl-9 py-2.5"
              placeholder="Search by name, UHID, phone…"
            />
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="table min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/60">Patient</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/60">UHID</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/60 hidden md:table-cell">Age / Sex</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/60 hidden lg:table-cell">Contact</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/60 hidden xl:table-cell">ABHA / Aadhaar</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/60">Token</th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800/60"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {patientLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${55 + (j * 7) % 40}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : patients.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center">
                          <div className="text-5xl mb-4">👤</div>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">No patients found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {search ? `No results for "${search}"` : 'Register your first patient to get started'}
                          </p>
                          {!search && (
                            <button onClick={() => setShowRegister(true)} className="btn-primary mt-5 gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              Register First Patient
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                    : patients.map(patient => {
                        const activeToken = queue.find(a =>
                          (a.patientId?._id === patient._id || a.patientId === patient._id) &&
                          ['triage', 'waiting', 'in-progress', 'hold'].includes(a.status)
                        );
                        return (
                          <tr
                            key={patient._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                            onClick={() => navigate(`/patients/card/${patient._id}`)}
                          >
                            {/* Patient avatar + name */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                                  {patient.firstName?.[0]}{patient.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                                    {patient.firstName} {patient.lastName}
                                  </div>
                                  {patient.bloodGroup && (
                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">{patient.bloodGroup}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            {/* UHID */}
                            <td className="px-4 py-3">
                              <span className="font-mono text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
                                {patient.uhid}
                              </span>
                            </td>
                            {/* Age / Sex */}
                            <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600 dark:text-gray-400">
                              {calcAge(patient.dateOfBirth)} · <span className="capitalize">{patient.gender}</span>
                            </td>
                            {/* Contact */}
                            <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
                              {patient.phone}
                            </td>
                            {/* ABHA / Aadhaar */}
                            <td className="px-4 py-3 hidden xl:table-cell">
                              <div className="space-y-1">
                                {patient.abha ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">ABHA</span>
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                      {patient.abha.length >= 14
                                        ? `${patient.abha.slice(0, 2)}-XXXX-XXXX-${patient.abha.slice(-4)}`
                                        : `XXXX-${patient.abha.slice(-4)}`}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">No ABHA</span>
                                )}
                                {patient.aadhaar && (
                                  <div className="text-xs font-mono text-gray-400">XXXXXXXX{patient.aadhaar.slice(-4)}</div>
                                )}
                              </div>
                            </td>
                            {/* Token */}
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              {activeToken ? (
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${activeToken.status === 'in-progress' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'}`}>
                                    {activeToken.tokenNumber}
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_META[activeToken.status]?.color || ''}`}>
                                    {STATUS_META[activeToken.status]?.label || activeToken.status}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setTokenTarget(patient)}
                                  id={`btn-issue-token-${patient._id}`}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 font-medium transition-colors border border-primary-200 dark:border-primary-800 whitespace-nowrap"
                                >
                                  + Token
                                </button>
                              )}
                            </td>
                            {/* Actions */}
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => navigate(`/patients/card/${patient._id}`)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                title="View Card"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 flex-shrink-0">
              <p className="text-sm text-gray-500">Page {patientPage} of {totalPages} · {patientTotal} total</p>
              <div className="flex gap-2">
                <button
                  disabled={patientPage <= 1}
                  onClick={() => fetchPatients(patientPage - 1, search)}
                  className="btn-secondary text-sm py-1.5 disabled:opacity-40"
                >← Prev</button>
                <button
                  disabled={patientPage >= totalPages}
                  onClick={() => fetchPatients(patientPage + 1, search)}
                  className="btn-secondary text-sm py-1.5 disabled:opacity-40"
                >Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Token Queue Panel (right) ─────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col overflow-hidden">
          <TokenQueuePanel
            queue={queue}
            loading={queueLoading}
            onRefresh={fetchQueue}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      </div>

      {/* Modals */}
      {showRegister && (
        <RegistrationModal onClose={() => setShowRegister(false)} onSuccess={handleRegistered} />
      )}
      {tokenTarget && (
        <TokenModal
          patient={tokenTarget}
          doctors={doctors}
          onClose={() => setTokenTarget(null)}
          onSuccess={handleTokenIssued}
        />
      )}
    </div>
  );
}

