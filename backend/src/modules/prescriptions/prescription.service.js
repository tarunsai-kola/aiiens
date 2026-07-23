const { Prescription } = require('./prescription.model');
const ApiError = require('../../utils/ApiError');

class PrescriptionService {
  async savePrescription(data, hospitalId) {
    // If digitally signing, stamp the time
    if (data.isDigitallySigned && !data.signatureTimestamp) {
      data.signatureTimestamp = new Date();
    }

    const prescription = await Prescription.findOneAndUpdate(
      { consultationId: data.consultationId, hospitalId },
      { ...data, hospitalId },
      { new: true, upsert: true, runValidators: true }
    );
    return prescription;
  }

  async getByConsultation(consultationId, hospitalId) {
    return Prescription.findOne({ consultationId, hospitalId });
  }

  // A mock list of medicines for auto-suggestions
  // In a real app, this would query a standard pharmacology database
  searchMedicines(query) {
    const db = [
      'Paracetamol 500mg', 'Paracetamol 650mg', 'Amoxicillin 500mg',
      'Azithromycin 500mg', 'Pantoprazole 40mg', 'Omeprazole 20mg',
      'Ibuprofen 400mg', 'Cetirizine 10mg', 'Metformin 500mg', 
      'Amlodipine 5mg', 'Atorvastatin 10mg', 'Losartan 50mg',
      'Vitamin C 500mg', 'Zinc 50mg', 'Cough Syrup'
    ];
    
    if (!query) return [];
    
    const q = query.toLowerCase();
    return db.filter(m => m.toLowerCase().includes(q)).slice(0, 10);
  }
}

module.exports = new PrescriptionService();
