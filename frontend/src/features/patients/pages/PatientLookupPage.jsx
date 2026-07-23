import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../../api/patient.api';
import toast from 'react-hot-toast';

export default function PatientLookupPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const { data } = await patientApi.searchPatients(query.trim());
      setResults(data.data || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    // Navigate to patient dashboard or details (to be built later)
    // For now, maybe just route to patients list or dashboard with query
    toast.success(`Loaded patient: ${patient.firstName}`);
    // navigate(`/patients/${patient._id}`); 
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Lookup</h1>
        <p className="text-gray-500">Search by UHID, Aadhaar, ABHA, or Phone Number</p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            className="input flex-1 text-lg py-3"
            placeholder="Enter Phone, Aadhaar, ABHA or UHID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={loading} className="btn-primary px-8 text-lg whitespace-nowrap">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {searched && (
        <div className="space-y-4 animate-slide-up">
          {results.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
              <div className="text-gray-500 mb-4">No patient found matching "{query}"</div>
              <button onClick={() => navigate('/patients/register', { state: { prefill: query } })} className="btn-primary">
                Register New Patient
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Matching Records Found ({results.length})</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {results.map((patient) => (
                  <div key={patient._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-lg">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-lg">
                          {patient.firstName} {patient.lastName} <span className="text-sm font-normal text-gray-500 ml-2">({patient.gender}, {patient.age}y)</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex gap-4">
                          <span><strong className="text-gray-500 dark:text-gray-500">UHID:</strong> {patient.uhid}</span>
                          <span><strong className="text-gray-500 dark:text-gray-500">Phone:</strong> {patient.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleSelectPatient(patient)} className="btn-secondary px-6 py-2">
                      Load Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
