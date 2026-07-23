import React from 'react';

export default function LabReportPrint({ order }) {
  if (!order) return null;

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-900 font-sans mx-auto p-12">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-blue-700 uppercase tracking-tight">Aiiens</h1>
          <p className="text-gray-500 font-bold mt-1">Department of Laboratory Medicine</p>
          <p className="text-sm text-gray-400">123 Health Ave, Medical District</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-widest">Laboratory Report</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">Order No: {order._id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Patient & Report Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Patient Details</p>
          <p className="font-bold text-lg">{order.patientId?.firstName} {order.patientId?.lastName}</p>
          <p className="text-gray-600">UHID: {order.patientId?.uhid} | Age: {order.patientId?.age} | Sex: {order.patientId?.gender}</p>
          <p className="text-gray-600 mt-2">Referred By: Dr. {order.doctorId?.lastName || 'Walk-in'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Specimen Details</p>
          <p className="font-bold">{order.testId?.sampleType}</p>
          <p className="text-gray-600 mt-2">Collected: {order.sampleCollectionTime ? new Date(order.sampleCollectionTime).toLocaleString() : '-'}</p>
          <p className="text-gray-600">Reported: {order.resultEntryTime ? new Date(order.resultEntryTime).toLocaleString() : '-'}</p>
        </div>
      </div>

      {/* Test Name Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold uppercase tracking-widest border-b-2 border-gray-300 inline-block pb-1">
          {order.testId?.name}
        </h3>
      </div>

      {/* Results Table */}
      <table className="w-full text-left mb-8">
        <thead>
          <tr className="border-b-2 border-gray-800 text-gray-800 uppercase text-xs tracking-widest">
            <th className="py-2">Test Parameter</th>
            <th className="py-2">Result</th>
            <th className="py-2">Units</th>
            <th className="py-2 text-right">Reference Range</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {order.results?.map((res, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-3 text-gray-700">{res.parameterName}</td>
              <td className="py-3">
                <span className={`font-bold text-lg ${res.isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>
                  {res.value} {res.isAbnormal && '*'}
                </span>
              </td>
              <td className="py-3 text-gray-500">{order.testId?.parameters.find(p => p.name === res.parameterName)?.unit || '-'}</td>
              <td className="py-3 text-right text-gray-500 font-mono text-xs">
                {order.testId?.parameters.find(p => p.name === res.parameterName)?.referenceRange || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Notes */}
      {order.reportNotes && (
        <div className="mb-12">
          <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-2">Remarks / Interpretation</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">
            {order.reportNotes}
          </p>
        </div>
      )}

      {/* Signatures */}
      <div className="flex justify-between items-end mt-16 pt-8 border-t border-gray-200">
        <div className="text-center">
          <div className="font-bold text-gray-800">{order.technicianId?.firstName} {order.technicianId?.lastName}</div>
          <div className="text-xs text-gray-500 uppercase">Lab Technician</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-gray-800">{order.verifiedBy?.firstName} {order.verifiedBy?.lastName}</div>
          <div className="text-xs text-gray-500 uppercase">Consultant Pathologist</div>
          <div className="text-[10px] text-gray-400 mt-1">Electronically Verified on {new Date(order.verificationTime).toLocaleString()}</div>
        </div>
      </div>

      <div className="text-center mt-12 text-xs text-gray-400">
        <p>*** End of Report ***</p>
      </div>
    </div>
  );
}
