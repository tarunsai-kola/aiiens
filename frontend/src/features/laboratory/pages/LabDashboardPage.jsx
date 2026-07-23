import { useState, useEffect, useRef } from 'react';
import { laboratoryApi } from '../../../api/laboratory.api';
import { patientApi } from '../../../api/patient.api';
import LabReportPrint from './LabReportPrint';
import toast from 'react-hot-toast';

export default function LabDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ordered'); // ordered, sample_collected, completed, verified
  
  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // New Order State
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');

  // Result Entry State
  const [resultData, setResultData] = useState({}); // { paramName: { value: '', isAbnormal: false } }
  const [reportNotes, setReportNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await laboratoryApi.getLabOrders({ status: activeTab });
      setOrders(data.data || []);
    } catch (err) {
      toast.error('Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [patientsRes, testsRes] = await Promise.all([
        patientApi.searchPatients(''),
        laboratoryApi.getTestMasters()
      ]);
      setPatients(patientsRes.data.data || []);
      setTests(testsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load dependencies');
    }
  };

  const handleOpenOrderModal = () => {
    fetchDependencies();
    setShowOrderModal(true);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await laboratoryApi.createLabOrder({ patientId: selectedPatientId, testId: selectedTestId });
      toast.success('Test ordered successfully');
      setShowOrderModal(false);
      setSelectedPatientId('');
      setSelectedTestId('');
      if (activeTab === 'ordered') fetchOrders();
    } catch (err) {
      toast.error('Failed to order test');
    }
  };

  const handleCollectSample = async (id) => {
    try {
      await laboratoryApi.collectSample(id);
      toast.success('Sample marked as collected');
      fetchOrders();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleOpenResultModal = (order) => {
    setActiveOrder(order);
    const initialData = {};
    order.testId.parameters.forEach(p => {
      initialData[p.name] = { value: '', isAbnormal: false };
    });
    setResultData(initialData);
    setReportNotes('');
    setShowResultModal(true);
  };

  const handleUploadResults = async (e) => {
    e.preventDefault();
    try {
      const resultsArray = Object.keys(resultData).map(key => ({
        parameterName: key,
        value: resultData[key].value,
        isAbnormal: resultData[key].isAbnormal
      }));
      
      await laboratoryApi.uploadResults(activeOrder._id, { results: resultsArray, reportNotes });
      toast.success('Results uploaded successfully');
      setShowResultModal(false);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to upload results');
    }
  };

  const handleVerify = async (id) => {
    try {
      await laboratoryApi.verifyReport(id);
      toast.success('Report Verified');
      fetchOrders();
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const handlePrint = (order) => {
    setActiveOrder(order);
    setShowPrintModal(true);
  };

  const renderTabCard = (label, value) => (
    <button 
      onClick={() => setActiveTab(value)}
      className={`px-6 py-3 font-bold text-sm uppercase tracking-widest border-b-4 transition-colors ${activeTab === value ? 'border-primary-600 text-primary-700 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laboratory Workflow</h1>
          <p className="text-gray-500">LIMS Dashboard</p>
        </div>
        <button onClick={handleOpenOrderModal} className="btn-primary">
          + Order Test
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50">
          {renderTabCard('Pending Collection', 'ordered')}
          {renderTabCard('Pending Results', 'sample_collected')}
          {renderTabCard('Pending Verification', 'completed')}
          {renderTabCard('Verified / Ready', 'verified')}
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              No orders found in this status.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3">Order ID / Date</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Test</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-bold font-mono text-gray-700">{order._id.slice(-8).toUpperCase()}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold">{order.patientId?.firstName} {order.patientId?.lastName}</div>
                      <div className="text-xs text-gray-500">UHID: {order.patientId?.uhid}</div>
                    </td>
                    <td className="p-3 font-bold text-primary-700">{order.testId?.name}</td>
                    <td className="p-3 text-right">
                      {activeTab === 'ordered' && (
                        <button onClick={() => handleCollectSample(order._id)} className="btn-primary py-1 px-3 text-xs">Collect Sample</button>
                      )}
                      {activeTab === 'sample_collected' && (
                        <button onClick={() => handleOpenResultModal(order)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-xs">Enter Results</button>
                      )}
                      {activeTab === 'completed' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handlePrint(order)} className="btn-secondary py-1 px-3 text-xs">Preview</button>
                          <button onClick={() => handleVerify(order._id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs">Verify</button>
                        </div>
                      )}
                      {activeTab === 'verified' && (
                        <button onClick={() => handlePrint(order)} className="btn-secondary py-1 px-3 text-xs">View Report</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center font-bold bg-gray-50">
              <h2>Order Lab Test</h2>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="label">Select Patient</label>
                <select required className="input" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
                  <option value="">Select...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} (UHID: {p.uhid})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Select Test</label>
                <select required className="input" value={selectedTestId} onChange={e => setSelectedTestId(e.target.value)}>
                  <option value="">Select...</option>
                  {tests.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setShowOrderModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Entry Modal */}
      {showResultModal && activeOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[600px] max-h-full overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center font-bold bg-gray-50 shrink-0">
              <h2>Result Entry: {activeOrder.testId?.name}</h2>
              <button onClick={() => setShowResultModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleUploadResults} className="p-6 overflow-y-auto space-y-6">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                Patient: <span className="font-bold">{activeOrder.patientId?.firstName} {activeOrder.patientId?.lastName}</span>
              </div>
              
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-2">Parameter</th>
                    <th className="p-2">Result Value</th>
                    <th className="p-2 text-center">Abnormal?</th>
                    <th className="p-2 text-xs">Ref Range</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrder.testId?.parameters.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-2 font-bold">{p.name} <span className="text-xs text-gray-500 font-normal">({p.unit})</span></td>
                      <td className="p-2">
                        <input 
                          required type="text" className="input py-1 px-2 text-sm w-full"
                          value={resultData[p.name]?.value || ''}
                          onChange={e => setResultData({...resultData, [p.name]: { ...resultData[p.name], value: e.target.value }})}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input 
                          type="checkbox" className="w-4 h-4 cursor-pointer"
                          checked={resultData[p.name]?.isAbnormal || false}
                          onChange={e => setResultData({...resultData, [p.name]: { ...resultData[p.name], isAbnormal: e.target.checked }})}
                        />
                      </td>
                      <td className="p-2 text-xs text-gray-500">{p.referenceRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div>
                <label className="label">Report Remarks / Interpretation</label>
                <textarea className="input" rows="3" value={reportNotes} onChange={e => setReportNotes(e.target.value)}></textarea>
              </div>

              <div className="pt-4 flex gap-2 border-t shrink-0">
                <button type="button" onClick={() => setShowResultModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save & Complete Test</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintModal && activeOrder && (
        <div className="fixed inset-0 bg-gray-900/90 z-50 flex flex-col items-center justify-center p-8 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white rounded-xl shadow-2xl flex flex-col max-w-full print:shadow-none">
            <div className="p-4 bg-gray-100 border-b flex justify-between items-center print:hidden">
              <h2 className="font-bold">Report Preview</h2>
              <div className="flex gap-2">
                {activeTab === 'verified' && <button onClick={() => window.print()} className="btn-primary">Print PDF</button>}
                {activeTab === 'completed' && <button onClick={() => { handleVerify(activeOrder._id); setShowPrintModal(false); }} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">Approve & Verify</button>}
                <button onClick={() => setShowPrintModal(false)} className="btn-secondary">Close</button>
              </div>
            </div>
            
            <div className="bg-gray-200 overflow-y-auto flex justify-center py-8 print:py-0 print:bg-white" style={{ maxHeight: '85vh' }}>
              <div className="print-content shadow-lg print:shadow-none">
                <LabReportPrint order={activeOrder} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
