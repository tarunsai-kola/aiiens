import { useState, useEffect } from 'react';
import { laboratoryApi } from '../../../api/laboratory.api';
import toast from 'react-hot-toast';

export default function LabTestMasterPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '', code: '', department: 'Pathology', sampleType: 'Blood', price: 0,
    parameters: []
  });
  
  const [newParameter, setNewParameter] = useState({ name: '', unit: '', referenceRange: '' });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data } = await laboratoryApi.getTestMasters();
      setTests(data.data || []);
    } catch (err) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParameter = () => {
    if (!newParameter.name) return;
    setNewTest(prev => ({
      ...prev,
      parameters: [...prev.parameters, newParameter]
    }));
    setNewParameter({ name: '', unit: '', referenceRange: '' });
  };

  const handleRemoveParameter = (idx) => {
    setNewTest(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (newTest.parameters.length === 0) return toast.error('Add at least one parameter');
    
    try {
      await laboratoryApi.createTestMaster(newTest);
      toast.success('Lab Test Master created');
      setShowAddModal(false);
      setNewTest({ name: '', code: '', department: 'Pathology', sampleType: 'Blood', price: 0, parameters: [] });
      fetchTests();
    } catch (err) {
      toast.error('Failed to create test');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Test Master Catalog...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lab Test Master Catalog</h1>
          <p className="text-gray-500">Define tests, parameters, and reference ranges</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Define New Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <div key={test._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{test.name}</h3>
                <p className="text-xs text-gray-500 font-mono mt-1">{test.code}</p>
              </div>
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-bold uppercase">{test.department}</span>
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-2 font-bold uppercase">Sample Type: {test.sampleType}</div>
              <table className="w-full text-xs text-left">
                <thead className="text-gray-400">
                  <tr>
                    <th className="py-1">Parameter</th>
                    <th className="py-1 text-right">Unit</th>
                    <th className="py-1 text-right">Ref Range</th>
                  </tr>
                </thead>
                <tbody>
                  {test.parameters.map((p, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="py-1 font-semibold">{p.name}</td>
                      <td className="py-1 text-right text-gray-500">{p.unit || '-'}</td>
                      <td className="py-1 text-right text-gray-500">{p.referenceRange || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {tests.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            No Lab Tests defined yet.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[600px] overflow-hidden flex flex-col max-h-full">
            <div className="p-4 border-b flex justify-between items-center font-bold bg-gray-50">
              <h2>Define New Lab Test</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Test Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Test Name *</label>
                  <input type="text" className="input" placeholder="e.g. Complete Blood Count" value={newTest.name} onChange={e => setNewTest({...newTest, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Test Code *</label>
                  <input type="text" className="input uppercase font-mono" placeholder="e.g. CBC-01" value={newTest.code} onChange={e => setNewTest({...newTest, code: e.target.value})} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <select className="input" value={newTest.department} onChange={e => setNewTest({...newTest, department: e.target.value})}>
                    <option value="Pathology">Pathology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Hematology">Hematology</option>
                  </select>
                </div>
                <div>
                  <label className="label">Sample Type</label>
                  <select className="input" value={newTest.sampleType} onChange={e => setNewTest({...newTest, sampleType: e.target.value})}>
                    <option value="Blood">Blood</option>
                    <option value="Urine">Urine</option>
                    <option value="Swab">Swab</option>
                    <option value="Stool">Stool</option>
                  </select>
                </div>
                <div>
                  <label className="label">Base Price (₹)</label>
                  <input type="number" className="input" value={newTest.price} onChange={e => setNewTest({...newTest, price: e.target.value})} />
                </div>
              </div>

              {/* Parameters Builder */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-2">Test Parameters</h3>
                
                {newTest.parameters.length > 0 && (
                  <table className="w-full text-sm text-left mb-4">
                    <thead className="bg-gray-100 text-gray-500">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Unit</th>
                        <th className="p-2">Ref Range</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newTest.parameters.map((p, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 font-bold">{p.name}</td>
                          <td className="p-2 text-gray-500">{p.unit}</td>
                          <td className="p-2 text-gray-500">{p.referenceRange}</td>
                          <td className="p-2 text-right">
                            <button onClick={() => handleRemoveParameter(idx)} className="text-red-500">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <label className="label text-xs">Parameter Name</label>
                    <input type="text" className="input text-sm" placeholder="e.g. Hemoglobin" value={newParameter.name} onChange={e => setNewParameter({...newParameter, name: e.target.value})} />
                  </div>
                  <div className="w-24">
                    <label className="label text-xs">Unit</label>
                    <input type="text" className="input text-sm" placeholder="e.g. g/dL" value={newParameter.unit} onChange={e => setNewParameter({...newParameter, unit: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="label text-xs">Reference Range</label>
                    <input type="text" className="input text-sm" placeholder="e.g. 13.5 - 17.5" value={newParameter.referenceRange} onChange={e => setNewParameter({...newParameter, referenceRange: e.target.value})} />
                  </div>
                  <button type="button" onClick={handleAddParameter} className="btn-secondary h-10 px-4">Add</button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex gap-2 justify-end bg-gray-50">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={handleSaveTest} className="btn-primary">Save Test Master</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
