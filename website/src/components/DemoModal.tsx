import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';

// ─── Google Apps Script Web App URL ────────────────────────────────────────
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby57regZNecywmnURWJwxQ2CFmh0_oVU2ECnc_gS4SagWnMxQXka_RelqgeI6n4wUwA9g/exec';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  mobile: string;
  clinic: string;
  specialization: string;
  numDoctors: string;
  address: string;
  city: string;
  state: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  mobile: '',
  clinic: '',
  specialization: '',
  numDoctors: '',
  address: '',
  city: '',
  state: '',
};

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm';

const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    if (isOpen) {
      setForm(INITIAL_FORM);
      setIsSubmitting(false);
      setIsSuccess(false);
      setError('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      /**
       * Google Apps Script requires a GET or POST with query params when
       * CORS is involved, because the redirect from /exec → /dev strips
       * POST bodies. Sending as GET with URLSearchParams is the most
       * reliable cross-origin approach (no preflight, no body parsing issues).
       */
      const params = new URLSearchParams({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        clinic: form.clinic,
        specialization: form.specialization,
        numDoctors: form.numDoctors,
        address: form.address,
        city: form.city,
        state: form.state,
      });

      const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors', // Apps Script returns opaque response — that's fine
      });

      // With no-cors the response is opaque (type === 'opaque'), status is 0.
      // As long as no exception is thrown the script executed successfully.
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* ── Header ── */}
              <div className="flex items-start justify-between px-7 py-6 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Book a Free Demo
                  </h3>
                  {!isSuccess && (
                    <p className="text-slate-500 text-sm mt-1">
                      Fill in your details — our team will reach out within 24 hours.
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 mt-0.5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ── Body ── */}
              <div className="flex-1 overflow-y-auto px-7 py-6 bg-slate-50">
                {isSuccess ? (
                  /* ── Success state ── */
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-14 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.55, delay: 0.1 }}
                    >
                      <CheckCircle className="text-emerald-500 w-20 h-20 mb-5" strokeWidth={1.5} />
                    </motion.div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-2">
                      Request Received! 🎉
                    </h4>
                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Thank you for your interest in AIIENS Health. Our team will review your details and contact you shortly to schedule your demo.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Close Window
                    </button>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      {/* Name */}
                      <div>
                        <label className={labelCls}>
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Dr. John Doe"
                          className={inputCls}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className={labelCls}>
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="doctor@clinic.com"
                          className={inputCls}
                        />
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className={labelCls}>
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={form.mobile}
                          onChange={handleChange}
                          required
                          placeholder="+91 9876543210"
                          className={inputCls}
                        />
                      </div>

                      {/* Clinic */}
                      <div>
                        <label className={labelCls}>
                          Clinic / Hospital Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="clinic"
                          value={form.clinic}
                          onChange={handleChange}
                          required
                          placeholder="City General Hospital"
                          className={inputCls}
                        />
                      </div>

                      {/* Specialization */}
                      <div>
                        <label className={labelCls}>
                          Specialization <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={form.specialization}
                          onChange={handleChange}
                          required
                          placeholder="e.g. Cardiology, Pediatrics"
                          className={inputCls}
                        />
                      </div>

                      {/* Number of Doctors */}
                      <div>
                        <label className={labelCls}>
                          Number of Doctors <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="numDoctors"
                          value={form.numDoctors}
                          onChange={handleChange}
                          required
                          min="1"
                          placeholder="e.g. 10"
                          className={inputCls}
                        />
                      </div>

                      {/* Address */}
                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          Clinic Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          required
                          rows={3}
                          placeholder="Full clinic / hospital address..."
                          className={`${inputCls} resize-none`}
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className={labelCls}>
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          required
                          placeholder="Mumbai"
                          className={inputCls}
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className={labelCls}>
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          required
                          placeholder="Maharashtra"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {error}
                      </p>
                    )}

                    {/* Submit */}
                    <div className="pt-4 border-t border-slate-200">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-primary-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-primary-500 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2.5 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          'Submit Request →'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DemoModal;
