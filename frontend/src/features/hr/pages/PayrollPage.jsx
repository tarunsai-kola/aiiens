import { useState, useEffect } from 'react';
import { hrApi } from '../../../api/hr.api';
import toast from 'react-hot-toast';

export default function PayrollPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [year, setYear] = useState(new Date().getFullYear());
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const { data } = await hrApi.getPayrolls({ month, year });
      setPayrolls(data.data || []);
    } catch (err) {
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await hrApi.generatePayroll({ month, year });
      toast.success('Payroll Generated Successfully');
      fetchPayrolls();
    } catch (err) {
      toast.error('Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await hrApi.paySalary(id);
      toast.success('Salary Paid');
      fetchPayrolls();
    } catch (err) {
      toast.error('Payment failed');
    }
  };

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payroll & Salary</h1>
          <p className="text-gray-500">Generate and process monthly salaries</p>
        </div>
        <div className="flex gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500 font-bold block mb-1">Month</label>
            <select className="input font-bold" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-bold block mb-1">Year</label>
            <input type="number" className="input font-bold w-24" value={year} onChange={e => setYear(Number(e.target.value))} />
          </div>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary h-10">
            {generating ? 'Generating...' : 'Generate Payroll'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading payroll data...</div>
        ) : payrolls.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border-2 border-dashed border-gray-200 m-4 rounded-xl">
            No payroll generated for {months.find(m => m.value === month)?.label} {year}. Click "Generate Payroll" to calculate salaries.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4 text-right">Base Salary</th>
                <th className="p-4 text-right text-red-500">Deductions</th>
                <th className="p-4 text-right text-green-600">Net Salary</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(pay => (
                <tr key={pay._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold">{pay.userId?.firstName} {pay.userId?.lastName}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold">{pay.userId?.role?.replace('_', ' ')}</div>
                  </td>
                  <td className="p-4 text-right font-mono">₹{pay.baseSalary.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-red-500">-₹{pay.deductions.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono font-black text-green-600 text-lg">₹{pay.netSalary.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${pay.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {pay.status === 'Pending' ? (
                      <button onClick={() => handlePay(pay._id)} className="btn-primary py-1 px-3 text-xs">Mark as Paid</button>
                    ) : (
                      <span className="text-xs text-gray-400">Paid on {new Date(pay.paymentDate).toLocaleDateString()}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
