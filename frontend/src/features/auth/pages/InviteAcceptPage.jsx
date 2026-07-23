import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function InviteAcceptPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');
  const navigate = useNavigate();
  const { acceptInvite } = useAuth();

  const [form, setForm] = useState({ password: '', confirmPassword: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !hospitalId) {
      toast.error('Invalid invitation link');
      navigate('/login');
    }
  }, [token, hospitalId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await acceptInvite(token, form, hospitalId);
      toast.success('Invitation accepted. Welcome!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept invitation');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👋</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accept Invitation</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Please set your password to complete your account setup.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              className="input"
              placeholder="Create a strong password"
              required
            />
          </div>
          <div>
            <label className="label">Confirm Password *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              className="input"
              placeholder="Confirm your password"
              required
            />
          </div>
          <div>
            <label className="label">Phone Number (Optional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input"
              placeholder="Enter your phone number"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-60">
            {isSubmitting ? 'Setting up account...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
