import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [form, setForm] = useState({ email: '', hospitalId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.hospitalId) {
      toast.error('Please fill in both fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Enter your hospital ID and email to receive a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg mb-6">
              If an account matches those details, a password reset link has been sent to <strong>{form.email}</strong>.
            </div>
            <Link to="/login" className="btn-primary w-full block">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Hospital ID</label>
              <input
                type="text"
                value={form.hospitalId}
                onChange={(e) => setForm(f => ({ ...f, hospitalId: e.target.value }))}
                className="input"
                placeholder="Enter hospital ID"
                required
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="input"
                placeholder="you@hospital.com"
                required
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-60">
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-gray-500 hover:text-primary-600">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
