import React from 'react';

export default function PrescriptionPrint({ patient, doctor, vitals, diagnosis, medicines, labTests, radiology }) {
  const date = new Date().toLocaleDateString('en-IN');

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-gray-900 font-sans mx-auto p-12">
      {/* Header */}
      <div className="border-b-4 border-primary-600 pb-6 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-primary-700 uppercase tracking-tight">Aiiens</h1>
          <p className="text-gray-500 font-bold mt-1">Multi-Specialty Hospital</p>
          <p className="text-sm text-gray-400">123 Health Ave, Medical District</p>
          <p className="text-sm text-gray-400">Phone: +91 1800-123-456</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">Dr. {doctor?.firstName} {doctor?.lastName}</h2>
          <p className="text-sm font-semibold text-primary-600">MBBS, MD</p>
          <p className="text-xs text-gray-400">Reg No: MED-12345</p>
        </div>
      </div>

      {/* Patient Info Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 flex justify-between text-sm">
        <div>
          <p><span className="text-gray-500">Patient Name:</span> <span className="font-bold">{patient?.firstName} {patient?.lastName}</span></p>
          <p><span className="text-gray-500">UHID:</span> <span className="font-bold">{patient?.uhid}</span></p>
        </div>
        <div>
          <p><span className="text-gray-500">Age/Gender:</span> <span className="font-bold">{patient?.age} Yrs / {patient?.gender}</span></p>
          <p><span className="text-gray-500">Date:</span> <span className="font-bold">{date}</span></p>
        </div>
      </div>

      {/* Clinical Body Layout */}
      <div className="flex gap-8 min-h-[500px]">
        {/* Left Col: Vitals & Investigations */}
        <div className="w-1/3 border-r border-gray-200 pr-8 space-y-8">
          
          {vitals && (
            <div>
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-3 border-b pb-1">Vitals</h3>
              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-500">BP</span><span>{vitals.bpSystolic}/{vitals.bpDiastolic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Temp</span><span>{vitals.temperature}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pulse</span><span>{vitals.pulse} bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SpO2</span><span>{vitals.spo2}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span><span>{vitals.weight} kg</span>
                </div>
              </div>
            </div>
          )}

          {diagnosis && (
            <div>
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-3 border-b pb-1">Diagnosis</h3>
              <p className="text-sm font-bold text-gray-800">{diagnosis}</p>
            </div>
          )}

          {labTests && (
            <div>
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-3 border-b pb-1">Lab Tests</h3>
              <ul className="list-disc pl-4 text-sm font-bold text-gray-800 space-y-1">
                {labTests.split(',').map((l, i) => <li key={i}>{l.trim()}</li>)}
              </ul>
            </div>
          )}

          {radiology && (
            <div>
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-3 border-b pb-1">Radiology</h3>
              <ul className="list-disc pl-4 text-sm font-bold text-gray-800 space-y-1">
                {radiology.split(',').map((r, i) => <li key={i}>{r.trim()}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Right Col: Medicines */}
        <div className="flex-1">
          <div className="text-6xl text-gray-300 font-serif italic mb-4">Rx</div>
          
          {medicines && medicines.length > 0 ? (
            <div className="space-y-6 mt-4">
              {medicines.map((m, i) => (
                <div key={i} className="border-b border-gray-100 pb-4">
                  <div className="font-bold text-lg text-gray-900">{i + 1}. {m.name}</div>
                  <div className="text-gray-600 mt-1 text-sm flex gap-6">
                    <span><strong className="text-gray-900">{m.dosage}</strong></span>
                    <span><strong className="text-gray-900">{m.frequency}</strong></span>
                    <span><strong className="text-gray-900">{m.duration}</strong></span>
                  </div>
                  {m.advice && <div className="text-sm text-gray-500 mt-1 italic">Note: {m.advice}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No medicines prescribed.</p>
          )}
        </div>
      </div>

      {/* Footer Signature */}
      <div className="mt-20 flex justify-end">
        <div className="text-center">
          <div className="text-primary-600 font-['Brush_Script_MT'] italic text-4xl mb-2 px-8 border-b-2 border-gray-300">
            {doctor?.firstName}
          </div>
          <p className="font-bold text-gray-800">Dr. {doctor?.firstName} {doctor?.lastName}</p>
          <p className="text-xs text-gray-400">Digitally Signed & Verified</p>
          <p className="text-xs text-gray-400">{new Date().toLocaleString()}</p>
        </div>
      </div>
      
      {/* Absolute Print Footer */}
      <div className="mt-12 text-center text-xs text-gray-300 border-t pt-4">
        Valid only when digitally signed. System generated prescription.
      </div>
    </div>
  );
}
