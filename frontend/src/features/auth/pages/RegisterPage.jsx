import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterHospitalPage() {
  const { registerHospital, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    hospitalName: '',
    hospitalType: 'general',
    hospitalPhone: '',
    hospitalEmail: '',
    city: '',
    state: '',
    firstName: '',
    lastName: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
    planSlug: 'starter',
  });
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const e = {};
    if (!form.hospitalName.trim()) e.hospitalName = 'Hospital name is required';
    if (!form.hospitalPhone.trim()) e.hospitalPhone = 'Hospital phone is required';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.adminEmail.trim()) e.adminEmail = 'Admin email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.adminEmail)) e.adminEmail = 'Invalid email';
    if (!form.adminPassword) e.adminPassword = 'Password is required';
    else if (form.adminPassword.length < 8) e.adminPassword = 'At least 8 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNext = () => {
    let errs = {};
    if (step === 1) errs = validateStep1();
    if (step === 2) errs = validateStep2();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerHospital(form);
      toast.success('Hospital registered successfully!');
      // Assuming context handles login state via tokens returned
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Register Hospital</h1>
            <p className="text-gray-500 dark:text-gray-400">Step {step} of 3</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Step 1: Hospital Details */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Hospital Information</h2>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="label">Hospital Name *</label>
                    <input name="hospitalName" value={form.hospitalName} onChange={handleChange} className={`input ${errors.hospitalName ? 'border-red-500' : ''}`} placeholder="e.g. Apollo Delhi" />
                    {errors.hospitalName && <p className="text-xs text-red-500 mt-1">{errors.hospitalName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Hospital Type</label>
                      <select name="hospitalType" value={form.hospitalType} onChange={handleChange} className="input">
                        <option value="general">General</option>
                        <option value="specialty">Specialty</option>
                        <option value="clinic">Clinic</option>
                        <option value="diagnostic">Diagnostic</option>
                        <option value="multispecialty">Multispecialty</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Phone *</label>
                      <input name="hospitalPhone" value={form.hospitalPhone} onChange={handleChange} className={`input ${errors.hospitalPhone ? 'border-red-500' : ''}`} placeholder="e.g. +91 9876543210" />
                      {errors.hospitalPhone && <p className="text-xs text-red-500 mt-1">{errors.hospitalPhone}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">City</label>
                      <input name="city" value={form.city} onChange={handleChange} className="input" placeholder="e.g. New Delhi" />
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input name="state" value={form.state} onChange={handleChange} className="input" placeholder="e.g. Delhi" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Admin Details */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Details</h2>
                <div className="grid grid-cols-1 gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name *</label>
                      <input name="firstName" value={form.firstName} onChange={handleChange} className={`input ${errors.firstName ? 'border-red-500' : ''}`} />
                      {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="label">Last Name *</label>
                      <input name="lastName" value={form.lastName} onChange={handleChange} className={`input ${errors.lastName ? 'border-red-500' : ''}`} />
                      {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Admin Email *</label>
                    <input type="email" name="adminEmail" value={form.adminEmail} onChange={handleChange} className={`input ${errors.adminEmail ? 'border-red-500' : ''}`} placeholder="admin@hospital.com" />
                    {errors.adminEmail && <p className="text-xs text-red-500 mt-1">{errors.adminEmail}</p>}
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <input type="password" name="adminPassword" value={form.adminPassword} onChange={handleChange} className={`input ${errors.adminPassword ? 'border-red-500' : ''}`} />
                    {errors.adminPassword && <p className="text-xs text-red-500 mt-1">{errors.adminPassword}</p>}
                    <p className="text-xs text-gray-400 mt-1">Must be at least 8 chars with an uppercase, lowercase, number and special char.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Plan Selection */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Select a Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['starter', 'growth', 'professional', 'enterprise'].map((plan) => (
                    <div 
                      key={plan}
                      onClick={() => setForm(f => ({ ...f, planSlug: plan }))}
                      className={`p-4 border rounded-xl cursor-pointer transition-colors ${form.planSlug === plan ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'}`}
                    >
                      <h3 className="text-lg font-bold capitalize text-gray-900 dark:text-white">{plan}</h3>
                      <p className="text-sm text-gray-500 mt-1">14-day free trial included.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="btn-secondary px-6">Back</button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="btn-primary px-8">Next</button>
              ) : (
                <button type="submit" disabled={isLoading} className="btn-primary px-8 disabled:opacity-60">
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
