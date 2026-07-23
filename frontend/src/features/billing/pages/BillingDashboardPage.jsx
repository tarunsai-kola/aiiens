import { useState, useEffect } from 'react';
import { billingApi } from '../../../api/billing.api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BillingDashboardPage() {
  const [bills, setBills] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, reportRes] = await Promise.all([
        billingApi.getBills(),
        billingApi.getCollectionReport()
      ]);
      setBills(billsRes.data.data || []);
      setReport(reportRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = report.reduce((acc, curr) => acc + curr.totalCollected, 0);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Billing Dashboard...</div>;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Central Billing</h1>
          <p className="text-gray-500">Invoices, Collections & Refunds</p>
        </div>
        <Link to="/billing/pos" className="btn-primary">
          + Create New Bill
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-sm font-bold text-gray-500 uppercase">Total Collected</span>
          <span className="text-4xl font-black text-primary-600 mt-2">₹{totalCollected.toFixed(2)}</span>
        </div>
        
        {report.map(r => (
          <div key={r._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-sm font-bold text-gray-500 uppercase">{r._id}</span>
            <span className="text-3xl font-black text-gray-800 mt-2">₹{r.totalCollected.toFixed(2)}</span>
            <span className="text-xs text-gray-400 mt-1">{r.count} txns</span>
          </div>
        ))}
      </div>

      {/* Bills Ledger */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-bold bg-gray-50 flex justify-between items-center">
          <span>Recent Invoices</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 border-b border-gray-100">
            <tr>
              <th className="p-4">Inv No / Date</th>
              <th className="p-4">Patient</th>
              <th className="p-4">Items</th>
              <th className="p-4 text-right">Net Amount</th>
              <th className="p-4 text-right">Balance Due</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {bills.map(b => (
              <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{b._id.slice(-8).toUpperCase()}</div>
                  <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="p-4 font-bold text-gray-900">{b.patientId?.firstName} {b.patientId?.lastName}</td>
                <td className="p-4 text-gray-500">{b.items.length} items</td>
                <td className="p-4 text-right font-bold">₹{b.netTotal.toFixed(2)}</td>
                <td className="p-4 text-right font-bold text-red-500">₹{b.amountDue.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    b.status === 'paid' ? 'bg-green-100 text-green-700' :
                    b.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link to={`/billing/pos?billId=${b._id}`} className="text-primary-600 font-bold hover:underline">
                    View / Pay
                  </Link>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-400">No bills generated yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
