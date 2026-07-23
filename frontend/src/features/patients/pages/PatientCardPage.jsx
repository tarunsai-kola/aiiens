import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { patientApi } from '../../../api/patient.api';
import toast from 'react-hot-toast';

export default function PatientCardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data } = await patientApi.getPatient(id);
      setPatient(data.data);
    } catch (err) {
      toast.error('Failed to load patient card');
      navigate('/patients/lookup');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Patient Card...</div>;
  if (!patient) return null;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={() => navigate('/patients/lookup')} className="text-gray-500 hover:text-gray-900 transition-colors">
          &larr; Back to Search
        </button>
        <button onClick={handlePrint} className="btn-primary px-6 flex items-center gap-2">
          <span>🖨️</span> Print Card
        </button>
      </div>

      {/* The Printable Patient Card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-w-md mx-auto print:shadow-none print:border-2 print:border-black" id="patient-card">
        {/* Header (Hospital Branding area) */}
        <div className="bg-primary-600 text-white p-6 text-center">
          <div className="font-bold text-xl tracking-wider uppercase mb-1">HealthCare HMS</div>
          <div className="text-primary-100 text-sm">Official Patient Identification</div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <QRCode 
                value={patient.uhid || patient._id} 
                size={80}
                level="M"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">{patient.firstName} {patient.lastName}</h2>
            <div className="text-lg font-mono font-medium text-primary-600 tracking-wider mt-1 border-2 border-primary-100 px-4 py-1 rounded-full bg-primary-50">
              {patient.uhid}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Date of Birth</div>
                <div className="font-medium text-gray-900">{new Date(patient.dateOfBirth).toLocaleDateString('en-GB')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Gender</div>
                <div className="font-medium text-gray-900 capitalize">{patient.gender}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Blood Group</div>
                <div className="font-medium text-red-600 font-bold">{patient.bloodGroup || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-medium">Contact</div>
                <div className="font-medium text-gray-900">{patient.phone}</div>
              </div>
            </div>

            {patient.abha && (
              <div className="pt-2">
                <div className="text-xs text-gray-500 uppercase font-medium">ABHA Number</div>
                <div className="font-medium text-gray-900 tracking-wider">{patient.abha}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
          This card is non-transferable and must be presented at every visit.
        </div>
      </div>
    </div>
  );
}
