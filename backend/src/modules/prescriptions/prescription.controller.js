const prescriptionService = require('./prescription.service');
const ApiResponse = require('../../utils/ApiResponse');

class PrescriptionController {
  async savePrescription(req, res) {
    const payload = {
      ...req.body,
      doctorId: req.user.id
    };
    
    const rx = await prescriptionService.savePrescription(payload, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Prescription saved successfully', rx));
  }

  async getPrescription(req, res) {
    const { consultationId } = req.params;
    const rx = await prescriptionService.getByConsultation(consultationId, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Prescription retrieved', rx));
  }

  searchMedicines(req, res) {
    const { q } = req.query;
    const results = prescriptionService.searchMedicines(q);
    res.status(200).json(ApiResponse.success('Medicines retrieved', results));
  }
}

module.exports = new PrescriptionController();
