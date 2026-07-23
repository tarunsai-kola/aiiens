import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/admin.api';
import toast from 'react-hot-toast';

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: { timezone: 'Asia/Kolkata', currency: 'INR', language: 'en', dateFormat: 'DD/MM/YYYY' },
    appointment: { slotDurationMinutes: 15, maxAdvanceBookingDays: 30, workingHours: [] },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await adminApi.getSettings();
      if (data.data) {
        setSettings(data.data);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setSettings((s) => ({ ...s, general: { ...s.general, [name]: value } }));
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setSettings((s) => ({ ...s, appointment: { ...s.appointment, [name]: Number(value) } }));
  };

  const handleWorkingHourChange = (index, field, value) => {
    const updatedHours = [...settings.appointment.workingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setSettings((s) => ({ ...s, appointment: { ...s.appointment, workingHours: updatedHours } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure system-wide preferences and working hours</p>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary px-6">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        {/* Localization */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Localization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Timezone</label>
              <select name="timezone" value={settings.general?.timezone || 'Asia/Kolkata'} onChange={handleGeneralChange} className="input">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select name="currency" value={settings.general?.currency || 'INR'} onChange={handleGeneralChange} className="input">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="label">Date Format</label>
              <select name="dateFormat" value={settings.general?.dateFormat || 'DD/MM/YYYY'} onChange={handleGeneralChange} className="input">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Appointment Defaults</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Default Slot Duration (Minutes)</label>
              <select name="slotDurationMinutes" value={settings.appointment?.slotDurationMinutes || 15} onChange={handleAppointmentChange} className="input">
                {[10, 15, 20, 30, 45, 60].map(val => <option key={val} value={val}>{val} min</option>)}
              </select>
            </div>
            <div>
              <label className="label">Max Advance Booking (Days)</label>
              <input type="number" name="maxAdvanceBookingDays" value={settings.appointment?.maxAdvanceBookingDays || 30} onChange={handleAppointmentChange} className="input" min="1" max="365" />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Working Hours</h2>
          <div className="space-y-3">
            {settings.appointment?.workingHours?.map((wh, index) => (
              <div key={wh.day} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="w-32">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={wh.isOpen} 
                      onChange={(e) => handleWorkingHourChange(index, 'isOpen', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{wh.day}</span>
                  </label>
                </div>
                {wh.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={wh.open} onChange={(e) => handleWorkingHourChange(index, 'open', e.target.value)} className="input !py-1 !text-sm w-32" />
                    <span className="text-gray-500">to</span>
                    <input type="time" value={wh.close} onChange={(e) => handleWorkingHourChange(index, 'close', e.target.value)} className="input !py-1 !text-sm w-32" />
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-gray-400 italic">Closed</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
