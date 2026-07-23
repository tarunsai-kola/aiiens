import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/admin.api';
import toast from 'react-hot-toast';

export default function HospitalProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'general',
    contact: { primaryPhone: '', email: '', website: '' },
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await adminApi.getHospitalProfile();
      const hospital = data.data;
      if (hospital && hospital._id) {
        setForm({
          name: hospital.name || '',
          type: hospital.type || 'general',
          contact: hospital.contact || { primaryPhone: '', email: '', website: '' },
          address: hospital.address || { street: '', city: '', state: '', zipCode: '', country: '' },
        });
      }
    } catch (err) {
      console.error('[HospitalProfile] Fetch error:', err);
      toast.error(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setForm((f) => ({ ...f, [section]: { ...f[section], [field]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateHospitalProfile(form);
      toast.success('Hospital profile updated successfully!');
    } catch (err) {
      console.error('[HospitalProfile] Save error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hospital Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage basic information and contact details</p>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary px-6">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <form className="space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Hospital Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Hospital Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="input">
                  <option value="general">General</option>
                  <option value="specialty">Specialty</option>
                  <option value="clinic">Clinic</option>
                  <option value="diagnostic">Diagnostic</option>
                  <option value="multispecialty">Multispecialty</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Primary Phone</label>
                <input name="contact.primaryPhone" value={form.contact.primaryPhone} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" name="contact.email" value={form.contact.email} onChange={handleChange} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Website</label>
                <input type="url" name="contact.website" value={form.contact.website || ''} onChange={handleChange} className="input" placeholder="https://" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Location</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Street Address</label>
                <input name="address.street" value={form.address.street} onChange={handleChange} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input name="address.city" value={form.address.city} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input name="address.state" value={form.address.state} onChange={handleChange} className="input" />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
