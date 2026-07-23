import React from 'react';

export default function TaxInvoicePrint({ bill, payments = [] }) {
  if (!bill) return null;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-900 font-sans mx-auto p-12">
      {/* Header */}
      <div className="border-b-4 border-primary-600 pb-6 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-primary-700 uppercase tracking-tight">Aiiens</h1>
          <p className="text-gray-500 font-bold mt-1">Multi-Specialty Hospital</p>
          <p className="text-sm text-gray-400">123 Health Ave, Medical District</p>
          <p className="text-sm text-gray-400">GSTIN: 27AAAAA1234A1Z5</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-widest">Tax Invoice</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">Inv No: {bill._id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-gray-400">Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 flex justify-between text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Billed To</p>
          <p className="font-bold text-lg">{bill.patientId?.firstName} {bill.patientId?.lastName}</p>
          <p className="text-gray-600">UHID: {bill.patientId?.uhid}</p>
          <p className="text-gray-600">{bill.patientId?.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Cashier</p>
          <p className="font-bold">{bill.cashierId?.firstName} {bill.cashierId?.lastName}</p>
          <div className="mt-2 inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-gray-300">
            Status: {bill.status}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <table className="w-full text-left mb-8">
        <thead>
          <tr className="border-b-2 border-gray-800 text-gray-800 uppercase text-xs tracking-widest">
            <th className="py-2">Sl.</th>
            <th className="py-2">Description</th>
            <th className="py-2 text-center">Type</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Rate</th>
            <th className="py-2 text-right">Tax %</th>
            <th className="py-2 text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {bill.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-3 text-gray-500">{idx + 1}</td>
              <td className="py-3 font-bold">{item.name}</td>
              <td className="py-3 text-center text-xs text-gray-500 capitalize">{item.itemType}</td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right">{item.unitPrice.toFixed(2)}</td>
              <td className="py-3 text-right">{item.taxPercentage}%</td>
              <td className="py-3 text-right font-bold">{item.subTotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Financials & Payments Grid */}
      <div className="flex gap-8 border-t-2 border-gray-800 pt-6">
        {/* Payments History */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-3">Payment History</h3>
          {payments.length > 0 ? (
            <table className="w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Method</th>
                  <th className="p-2">Txn ID</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 uppercase font-bold">{p.method}</td>
                    <td className="p-2 text-gray-500">{p.transactionId || '-'}</td>
                    <td className="p-2 text-right font-bold text-green-600">₹{p.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-400 italic">No payments recorded yet.</p>
          )}
        </div>

        {/* Totals */}
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Gross Total</span> <span>₹{bill.grossTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Discount</span> <span className="text-red-500">-₹{bill.totalDiscount.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Tax (GST)</span> <span>+₹{bill.taxTotal.toFixed(2)}</span></div>
          
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
            <span>Net Amount</span> <span>₹{bill.netTotal.toFixed(2)}</span>
          </div>
          
          {bill.insuranceCoverage > 0 && (
            <div className="flex justify-between text-gray-600 italic">
              <span>Insurance</span> <span>-₹{bill.insuranceCoverage.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-green-600 font-bold">
            <span>Paid Amount</span> <span>₹{bill.amountPaid.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-black text-xl pt-2 border-t-2 border-gray-800 text-primary-700">
            <span>Balance Due</span> <span>₹{bill.amountDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-xs text-gray-400 border-t pt-4">
        <p>This is a computer generated invoice and does not require a physical signature.</p>
        <p>Subject to local jurisdiction. E&OE.</p>
      </div>
    </div>
  );
}
