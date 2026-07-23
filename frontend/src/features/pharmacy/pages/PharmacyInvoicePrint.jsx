import React from 'react';

export default function PharmacyInvoicePrint({ invoice, hospitalInfo }) {
  if (!invoice) return null;

  return (
    <div className="w-[80mm] min-h-[100mm] bg-white text-gray-900 font-mono mx-auto p-4 text-xs">
      {/* Header */}
      <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-4">
        <h1 className="text-lg font-black uppercase tracking-tight">Aiiens Pharmacy</h1>
        <p>123 Health Ave, Medical District</p>
        <p>Phone: +91 1800-123-456</p>
        <p className="mt-2 font-bold text-sm">TAX INVOICE / RECEIPT</p>
      </div>

      {/* Details */}
      <div className="mb-4">
        <p>Date: {new Date(invoice.createdAt).toLocaleString()}</p>
        <p>Invoice No: {invoice._id.slice(-8).toUpperCase()}</p>
        <p>Patient: {invoice.patientId?.firstName} {invoice.patientId?.lastName}</p>
        <p>Pharmacist: {invoice.pharmacistId?.firstName}</p>
      </div>

      {/* Items */}
      <table className="w-full text-left mb-4 border-b border-dashed border-gray-400 pb-2">
        <thead>
          <tr className="border-b border-dashed border-gray-400">
            <th className="py-1">Item</th>
            <th className="py-1 text-right">Qty</th>
            <th className="py-1 text-right">Price</th>
            <th className="py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 pr-2">{item.brandName}</td>
              <td className="py-1 text-right">{item.quantity}</td>
              <td className="py-1 text-right">₹{item.unitPrice.toFixed(2)}</td>
              <td className="py-1 text-right">₹{item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="text-right space-y-1 font-bold">
        <p>Subtotal: ₹{invoice.subTotal.toFixed(2)}</p>
        <p>Tax: ₹{invoice.taxTotal.toFixed(2)}</p>
        <p className="text-lg border-t border-dashed border-gray-400 pt-1 mt-1">
          Total: ₹{invoice.grandTotal.toFixed(2)}
        </p>
      </div>

      <div className="text-center mt-8 text-gray-500">
        <p>Thank you for your visit!</p>
        <p>Get well soon.</p>
      </div>
    </div>
  );
}
