import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { patientApi } from '../../../api/patient.api';
import toast from 'react-hot-toast';

export default function PatientRegistrationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefill = location.state?.prefill || '';
  
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'male', bloodGroup: '',
    phone: '', email: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    aadhaar: '', abha: '',
    emergencyContact: { name: '', relationship: '', phone: '' },
    insurance: { provider: '', policyNumber: '', validTill: '' },
    allergies: '', chronicConditions: ''
  });

  // Attempt to prefill phone or aadhaar/abha if it looks like one
  useEffect(() => {
    if (prefill) {
      const isNum = /^[0-9]+$/.test(prefill);
      if (isNum && prefill.length === 10) setForm(f => ({ ...f, phone: prefill }));
      else if (isNum && prefill.length === 12) setForm(f => ({ ...f, aadhaar: prefill }));
      else if (isNum && prefill.length === 14) setForm(f => ({ ...f, abha: prefill }));
    }
  }, [prefill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setForm(f => ({ ...f, [section]: { ...f[section], [field]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: form.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        insurance: {
          ...form.insurance,
          validTill: form.insurance.validTill || null
        }
      };

      const { data } = await patientApi.registerPatient(payload);
      toast.success('Patient registered successfully!');
      
      // Navigate to lookup or dashboard showing the generated patient card
      navigate(`/patients/card/${data.data._id}`);
      
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to register patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Registration</h1>
          <p className="text-gray-500 mt-2">Enter complete details to generate UHID and Patient Card</p>
        </div>
        <button onClick={() => navigate('/patients/lookup')} className="text-primary-600 hover:underline">
          &larr; Back to Search
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-sm">1</span>
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label">First Name *</label>
              <input required name="firstName" value={form.firstName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input required name="lastName" value={form.lastName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Date of Birth *</label>
              <input required type="date" name="dateOfBirth" max={new Date().toISOString().split('T')[0]} value={form.dateOfBirth} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select required name="gender" value={form.gender} onChange={handleChange} className="input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="input">
                <option value="">Unknown</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact & Address */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-sm">2</span>
            Contact & Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Mobile Number *</label>
              <input required type="tel" name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="10-digit number" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input" placeholder="Optional" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Street Address</label>
              <input name="address.street" value={form.address.street} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">City</label>
              <input name="address.city" value={form.address.city} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">State</label>
              <input name="address.state" value={form.address.state} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">PIN Code</label>
              <input name="address.pincode" value={form.address.pincode} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        {/* Identifiers */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-sm">3</span>
            National Identifiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Aadhaar Number</label>
              <input name="aadhaar" value={form.aadhaar} onChange={handleChange} className="input" placeholder="12-digit Aadhaar" maxLength="12" />
            </div>
            <div>
              <label className="label">ABHA ID</label>
              <input name="abha" value={form.abha} onChange={handleChange} className="input" placeholder="14-digit ABHA Number" maxLength="14" />
            </div>
          </div>
        </div>

        {/* Insurance & Emergency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Emergency Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input name="emergencyContact.name" value={form.emergencyContact.name} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Relationship</label>
                <input name="emergencyContact.relationship" value={form.emergencyContact.relationship} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="emergencyContact.phone" value={form.emergencyContact.phone} onChange={handleChange} className="input" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Insurance Details</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Provider Name</label>
                <input name="insurance.provider" value={form.insurance.provider} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Policy Number</label>
                <input name="insurance.policyNumber" value={form.insurance.policyNumber} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Valid Till</label>
                <input type="date" name="insurance.validTill" value={form.insurance.validTill} onChange={handleChange} className="input" />
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-sm">4</span>
            Medical History (Optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Allergies (comma separated)</label>
              <textarea name="allergies" value={form.allergies} onChange={handleChange} className="input min-h-[100px]" placeholder="e.g. Penicillin, Peanuts" />
            </div>
            <div>
              <label className="label">Chronic Conditions (comma separated)</label>
              <textarea name="chronicConditions" value={form.chronicConditions} onChange={handleChange} className="input min-h-[100px]" placeholder="e.g. Diabetes Type 2, Hypertension" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" disabled={saving} className="btn-primary px-12 py-4 text-lg w-full md:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
            {saving ? 'Registering Patient...' : 'Complete Registration & Generate Card'}
          </button>
        </div>
      </form>
    </div>
  );
}
