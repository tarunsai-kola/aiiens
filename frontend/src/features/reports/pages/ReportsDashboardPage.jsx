import { useState, useEffect, useRef } from 'react';
import { reportsApi } from '../../../api/reports.api';
import toast from 'react-hot-toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#9333ea', '#06b6d4'];

export default function ReportsDashboardPage() {
  const [loading, setLoading] = useState(true);
  
  // Date Filter
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Data
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [revenueByDept, setRevenueByDept] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [patientDemographics, setPatientDemographics] = useState({ byAge: [], byGender: [] });

  const printRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, [dateRange, customStart, customEnd]);

  const getDateParams = () => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    if (dateRange === 'today') {
      startDate = endDate;
    } else if (dateRange === 'thisWeek') {
      const first = today.getDate() - today.getDay();
      startDate = new Date(today.setDate(first)).toISOString().split('T')[0];
    } else if (dateRange === 'thisMonth') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
      if (!customStart || !customEnd) return null; // Don't fetch until both are set
      startDate = customStart;
      endDate = customEnd;
    }

    return { startDate, endDate };
  };

  const fetchReports = async () => {
    const params = getDateParams();
    if (!params && dateRange === 'custom') return;

    setLoading(true);
    try {
      const [revTrend, revDept, meds, patients] = await Promise.all([
        reportsApi.getRevenueTrend({ ...params, groupBy: 'day' }),
        reportsApi.getRevenueByDepartment(params),
        reportsApi.getTopMedicines(params),
        reportsApi.getPatientDemographics(params)
      ]);

      setRevenueTrend(revTrend.data.data);
      setRevenueByDept(revDept.data.data);
      setTopMedicines(meds.data.data);
      setPatientDemographics(patients.data.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return toast.error('No data to export');
    
    // Convert array of objects to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => typeof val === 'string' ? `"${val}"` : val).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalRevenue = revenueTrend.reduce((sum, item) => sum + item.totalCollected, 0);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reporting & Analytics</h1>
          <p className="text-gray-500">Financial and Operational Insights</p>
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
            {['today', 'thisWeek', 'thisMonth', 'custom'].map(dr => (
              <button 
                key={dr}
                onClick={() => setDateRange(dr)}
                className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${dateRange === dr ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {dr.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
          {dateRange === 'custom' && (
            <div className="flex gap-2 items-center bg-white p-1 rounded-lg border border-gray-200">
              <input type="date" className="input text-sm py-1" value={customStart} onChange={e => setCustomStart(e.target.value)} />
              <span className="text-gray-400">to</span>
              <input type="date" className="input text-sm py-1" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            </div>
          )}
          <button onClick={handlePrint} className="btn-secondary h-10">Export PDF</button>
        </div>
      </div>

      <div ref={printRef} className="print:block space-y-6 print:text-black print:bg-white print:w-[210mm]">
        
        {/* PDF Header (Only visible when printing) */}
        <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-8">
          <h1 className="text-3xl font-black uppercase tracking-widest">Aiiens Analytics Report</h1>
          <p className="text-sm font-bold">Report Period: {dateRange} {dateRange === 'custom' ? `(${customStart} to ${customEnd})` : ''}</p>
          <p className="text-xs">Generated on: {new Date().toLocaleString()}</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 print:hidden">Crunching data...</div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-black print:shadow-none">
                <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Total Revenue</div>
                <div className="text-4xl font-black text-green-600 print:text-black">₹{totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-black print:shadow-none">
                <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Transactions</div>
                <div className="text-4xl font-black text-gray-800">{revenueTrend.reduce((sum, item) => sum + item.count, 0)}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-black print:shadow-none">
                <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">New Patients</div>
                <div className="text-4xl font-black text-gray-800">{patientDemographics.byGender.reduce((sum, i) => sum + i.count, 0)}</div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-3 gap-6">
              
              {/* Revenue Trend */}
              <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-black print:shadow-none print:break-inside-avoid">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-800">Revenue Trend</h3>
                  <button onClick={() => downloadCSV(revenueTrend, 'revenue_trend')} className="text-xs text-primary-600 font-bold hover:underline print:hidden">Export CSV</button>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="_id" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Line type="monotone" dataKey="totalCollected" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-black print:shadow-none print:break-inside-avoid">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-800">Revenue by Category</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByDept}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="revenue"
                        nameKey="_id"
                      >
                        {revenueByDept.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Top Medicines */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-black print:shadow-none print:break-inside-avoid">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-800">Top Selling Medicines</h3>
                  <button onClick={() => downloadCSV(topMedicines, 'top_medicines')} className="text-xs text-primary-600 font-bold hover:underline print:hidden">Export CSV</button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 border-b print:bg-white print:border-black">
                    <tr>
                      <th className="p-3">Medicine Brand</th>
                      <th className="p-3 text-right">Volume</th>
                      <th className="p-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMedicines.map((m, i) => (
                      <tr key={i} className="border-b border-gray-50 print:border-gray-200">
                        <td className="p-3 font-bold">{m._id}</td>
                        <td className="p-3 text-right">{m.volume}</td>
                        <td className="p-3 text-right text-green-600 font-bold print:text-black">₹{m.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                    {topMedicines.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-400">No pharmacy sales in this period</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Patient Demographics */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:border-black print:shadow-none print:break-inside-avoid">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-800">Patient Registrations by Age</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patientDemographics.byAge}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="_id" tickFormatter={(val) => `${val} yrs`} />
                      <YAxis />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="count" fill="#9333ea" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
