const patientService = require('./patient.service');
const ApiResponse = require('../../utils/ApiResponse');

class PatientController {
  async getAll(req, res) {
    const result = await patientService.getAllPatients(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Patients retrieved', result));
  }
  
  async search(req, res) {
    const { q } = req.query;
    const patients = await patientService.searchPatients(q, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Search results retrieved', patients));
  }

  async getOne(req, res) {
    const patient = await patientService.getPatientById(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Patient retrieved', patient));
  }

  async create(req, res) {
    const patient = await patientService.createPatient(req.body, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Patient registered successfully', patient));
  }

  async update(req, res) {
    const patient = await patientService.updatePatient(req.params.id, req.body, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Patient updated successfully', patient));
  }

  async delete(req, res) {
    await patientService.deletePatient(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Patient deleted successfully'));
  }
}

module.exports = new PatientController();
