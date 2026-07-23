import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { billingApi } from '../../../api/billing.api';
import { patientApi } from '../../../api/patient.api';
import TaxInvoicePrint from './TaxInvoicePrint';
import toast from 'react-hot-toast';

export default function BillCreatePage() {
  const [searchParams] = useSearchParams();
  const billId = searchParams.get('billId');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);
  const [payments, setPayments] = useState([]);
  
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Bill Creation State
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ itemType: 'consultation', name: '', quantity: 1, unitPrice: '', discount: 0, taxPercentage: 0 });
  const [billDiscount, setBillDiscount] = useState(0);
  const [insuranceCoverage, setInsuranceCoverage] = useState(0);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'cash', type: 'payment', transactionId: '', notes: '' });

  // Print State
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    if (billId) {
      fetchExistingBill(billId);
    } else {
      fetchPatients();
    }
  }, [billId]);

  const fetchExistingBill = async (id) => {
    setLoading(true);
    try {
      const { data } = await billingApi.getBillById(id);
      setBill(data.data.bill);
      setPayments(data.data.payments);
    } catch (err) {
      toast.error('Failed to load bill');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await patientApi.searchPatients('');
      setPatients(data.data || []);
    } catch (err) {}
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.unitPrice) return toast.error('Name and Price required');
    setItems([...items, {
      ...newItem, 
      unitPrice: Number(newItem.unitPrice),
      quantity: Number(newItem.quantity),
      discount: Number(newItem.discount),
      taxPercentage: Number(newItem.taxPercentage)
    }]);
    setNewItem({ itemType: 'consultation', name: '', quantity: 1, unitPrice: '', discount: 0, taxPercentage: 0 });
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleGenerateBill = async () => {
    if (!selectedPatientId) return toast.error('Select a patient first');
    if (items.length === 0) return toast.error('Add at least one item');

    try {
      const payload = {
        patientId: selectedPatientId,
        items,
        billDiscount: Number(billDiscount),
        insuranceCoverage: Number(insuranceCoverage)
      };

      const { data } = await billingApi.createBill(payload);
      toast.success('Bill Generated successfully');
      navigate(`/billing/pos?billId=${data.data._id}`);
    } catch (err) {
      toast.error('Failed to generate bill');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await billingApi.addPayment(bill._id, {
        ...paymentData,
        amount: Number(paymentData.amount)
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      setPaymentData({ amount: '', method: 'cash', type: 'payment', transactionId: '', notes: '' });
      fetchExistingBill(bill._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Bill Data...</div>;

  // Real-time calculation preview for new bills
  const previewGross = items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
  const previewItemDisc = items.reduce((acc, i) => acc + (i.discount || 0), 0);
  const previewTax = items.reduce((acc, i) => {
    const taxBase = (i.unitPrice * i.quantity) - (i.discount || 0);
    return acc + (taxBase * (i.taxPercentage || 0)) / 100;
  }, 0);
  const previewNet = previewGross - previewItemDisc - Number(billDiscount) + previewTax;
  const previewDue = Math.max(0, previewNet - Number(insuranceCoverage));

  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {bill ? `Invoice #${bill._id.slice(-8).toUpperCase()}` : 'Generate New Bill'}
          </h1>
          <p className="text-gray-500">{bill ? `Status: ${bill.status.toUpperCase()}` : 'Point of Sale'}</p>
        </div>
        <div className="flex gap-2">
          {bill && <button onClick={() => setShowPrint(true)} className="btn-secondary">🖨️ Print Invoice</button>}
          <button onClick={() => navigate('/billing/dashboard')} className="btn-secondary">Back to Dashboard</button>
        </div>
      </div>

      {!bill ? (
        // CREATE BILL MODE
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4">Patient & Demographics</h3>
              <select className="input w-full" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
                <option value="">Select Patient...</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} (UHID: {p.uhid})</option>)}
              </select>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4">Add Billable Items</h3>
              <div className="flex flex-wrap gap-4 items-end mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="w-32">
                  <label className="label text-xs">Type</label>
                  <select className="input" value={newItem.itemType} onChange={e => setNewItem({...newItem, itemType: e.target.value})}>
                    <option value="consultation">Consultation</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="procedure">Procedure</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="label text-xs">Description</label>
                  <input type="text" className="input" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                </div>
                <div className="w-16">
                  <label className="label text-xs">Qty</label>
                  <input type="number" min="1" className="input" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} />
                </div>
                <div className="w-24">
                  <label className="label text-xs">Unit Rate</label>
                  <input type="number" className="input" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: e.target.value})} />
                </div>
                <div className="w-24">
                  <label className="label text-xs">Discount (₹)</label>
                  <input type="number" className="input" value={newItem.discount} onChange={e => setNewItem({...newItem, discount: e.target.value})} />
                </div>
                <div className="w-20">
                  <label className="label text-xs">Tax %</label>
                  <input type="number" className="input" value={newItem.taxPercentage} onChange={e => setNewItem({...newItem, taxPercentage: e.target.value})} />
                </div>
                <button onClick={handleAddItem} className="btn-secondary h-10 px-4">Add</button>
              </div>

              {items.length > 0 && (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Qty x Rate</th>
                      <th className="p-2">Tax/Disc</th>
                      <th className="p-2 text-right">Subtotal</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i, idx) => {
                      const base = i.quantity * i.unitPrice;
                      const tax = ((base - i.discount) * i.taxPercentage) / 100;
                      const sub = base - i.discount + tax;
                      return (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-2 font-bold">{i.name}</td>
                          <td className="p-2 text-gray-500 capitalize">{i.itemType}</td>
                          <td className="p-2">{i.quantity} x ₹{i.unitPrice}</td>
                          <td className="p-2 text-gray-500 text-xs">Tax: {i.taxPercentage}%<br/>Disc: ₹{i.discount}</td>
                          <td className="p-2 text-right font-bold">₹{sub.toFixed(2)}</td>
                          <td className="p-2 text-right"><button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">✕</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <h3 className="font-bold">Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Gross Total</span> <span>₹{previewGross.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Item Discounts</span> <span>-₹{previewItemDisc.toFixed(2)}</span></div>
                
                <div className="flex justify-between items-center text-gray-600 pt-2 border-t">
                  <span>Bill Discount (Flat)</span> 
                  <input type="number" className="input w-24 text-right py-1" value={billDiscount} onChange={e => setBillDiscount(e.target.value)} />
                </div>
                
                <div className="flex justify-between text-gray-600"><span>Estimated Tax</span> <span>+₹{previewTax.toFixed(2)}</span></div>
                
                <div className="flex justify-between items-center text-gray-600 pt-2 border-t">
                  <span>Insurance Payout</span> 
                  <input type="number" className="input w-24 text-right py-1" value={insuranceCoverage} onChange={e => setInsuranceCoverage(e.target.value)} />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mt-4">
                <div className="flex justify-between text-sm text-gray-500 font-bold mb-1">
                  <span>Amount Due By Patient</span>
                </div>
                <div className="text-3xl font-black text-gray-900 text-right">₹{previewDue.toFixed(2)}</div>
              </div>

              <button onClick={handleGenerateBill} className="btn-primary w-full py-4 text-lg">Generate Bill</button>
            </div>
          </div>
        </div>

      ) : (
        // VIEW BILL & PAYMENTS MODE
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            
            {/* Bill Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Patient</p>
                <h2 className="text-xl font-bold text-gray-900">{bill.patientId?.firstName} {bill.patientId?.lastName}</h2>
                <p className="text-gray-500">UHID: {bill.patientId?.uhid} • Ph: {bill.patientId?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Bill Date</p>
                <p className="font-bold">{new Date(bill.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="p-4">Item Description</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Rate</th>
                    <th className="p-4 text-right">Total (Inc Tax)</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((i, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="p-4 font-bold">{i.name}</td>
                      <td className="p-4 text-gray-500 capitalize">{i.itemType}</td>
                      <td className="p-4 text-center">{i.quantity}</td>
                      <td className="p-4 text-right">₹{i.unitPrice}</td>
                      <td className="p-4 text-right font-bold">₹{i.subTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment History */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Payment Transactions</h3>
              {payments.length > 0 ? (
                <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Txn ID</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} className="border-t border-gray-100">
                        <td className="p-3">{new Date(p.createdAt).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.type === 'payment' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {p.type}
                          </span>
                        </td>
                        <td className="p-3 uppercase font-bold">{p.method}</td>
                        <td className="p-3 text-gray-500 font-mono text-xs">{p.transactionId || '-'}</td>
                        <td className={`p-3 text-right font-bold ${p.type === 'payment' ? 'text-green-600' : 'text-red-500'}`}>
                          {p.type === 'refund' ? '-' : ''}₹{p.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 italic">No payments recorded.</p>
              )}
            </div>

          </div>

          {/* Right Sidebar: Totals & Pay */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Bill Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600"><span>Gross Total</span> <span>₹{bill.grossTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Total Discount</span> <span className="text-red-500">-₹{bill.totalDiscount.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (GST)</span> <span>+₹{bill.taxTotal.toFixed(2)}</span></div>
                
                <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Net Amount</span> <span>₹{bill.netTotal.toFixed(2)}</span>
                </div>
                
                {bill.insuranceCoverage > 0 && (
                  <div className="flex justify-between text-gray-600 italic">
                    <span>Covered by TPA</span> <span>-₹{bill.insuranceCoverage.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t-2 border-gray-800 space-y-3">
                <div className="flex justify-between text-gray-600 font-bold">
                  <span>Amount Paid</span> <span className="text-green-600">₹{bill.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-black text-xl">
                  <span>Balance Due</span> <span className="text-red-600">₹{bill.amountDue.toFixed(2)}</span>
                </div>
              </div>

              {bill.amountDue > 0 && (
                <button onClick={() => setShowPaymentModal(true)} className="btn-primary w-full mt-6 py-3">
                  Record Payment (Split)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && bill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[400px] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center font-bold">
              <h2>Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center font-bold mb-2">
                Balance Due: ₹{bill.amountDue.toFixed(2)}
              </div>

              <div>
                <label className="label">Amount to Pay (₹)</label>
                <input 
                  required type="number" step="0.01" min="0.01" max={bill.amountDue} className="input font-bold text-lg" 
                  value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} 
                />
              </div>

              <div>
                <label className="label">Payment Method</label>
                <select className="input font-bold uppercase" value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / QR</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="insurance">Direct Insurance</option>
                </select>
              </div>

              {paymentData.method !== 'cash' && (
                <div>
                  <label className="label">Transaction ID / Reference</label>
                  <input required type="text" className="input font-mono" value={paymentData.transactionId} onChange={e => setPaymentData({...paymentData, transactionId: e.target.value})} />
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Overlay */}
      {showPrint && bill && (
        <div className="fixed inset-0 bg-gray-900/90 z-50 flex flex-col items-center justify-center p-8 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white rounded-xl shadow-2xl flex flex-col max-w-full print:shadow-none">
            <div className="p-4 bg-gray-100 border-b flex justify-between items-center print:hidden">
              <h2 className="font-bold">Tax Invoice Preview</h2>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="btn-primary">Print PDF</button>
                <button onClick={() => setShowPrint(false)} className="btn-secondary">Close</button>
              </div>
            </div>
            
            <div className="bg-gray-200 overflow-y-auto flex justify-center py-8 print:py-0 print:bg-white" style={{ maxHeight: '85vh' }}>
              <div className="print-content shadow-lg print:shadow-none">
                <TaxInvoicePrint bill={bill} payments={payments} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
