import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '', hospitalId: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.hospitalId.trim()) e.hospitalId = 'Hospital ID is required';
    if (!form.email.trim())      e.email      = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)          e.password   = 'Password is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await login({
        email:      form.email.trim().toLowerCase(),
        password:   form.password,
        hospitalId: form.hospitalId.trim(),
      });
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err?.message || 'Login failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Hospital Management System
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Streamline your hospital operations with our comprehensive management platform.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: '👥', label: 'Patients', value: '50K+' },
              { icon: '👨‍⚕️', label: 'Doctors',  value: '500+' },
              { icon: '🏨', label: 'Hospitals', value: '200+' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-bold text-xl text-white">{s.value}</div>
                <div className="text-blue-300 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 lg:p-10 animate-slide-up">
            {/* Logo (mobile) */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">H</div>
              <span className="font-bold text-gray-900 dark:text-white text-xl">HMS</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome back
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              Sign in to your hospital account
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Hospital ID */}
              <div>
                <label htmlFor="hospitalId" className="label">Hospital ID</label>
                <input
                  id="hospitalId"
                  name="hospitalId"
                  type="text"
                  autoComplete="off"
                  placeholder="Enter your hospital ID"
                  value={form.hospitalId}
                  onChange={handleChange}
                  className={`input ${errors.hospitalId ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.hospitalId && <p className="mt-1 text-xs text-red-500">{errors.hospitalId}</p>}
                <p className="mt-1 text-xs text-gray-400">Find this in your welcome email</p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@hospital.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className={`input pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white dark:bg-gray-900 px-3">
                New to HMS?
              </div>
            </div>

            <Link
              to="/register"
              id="register-link"
              className="btn-secondary w-full text-center py-3 text-sm block"
            >
              Register your hospital
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} HMS Platform · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
