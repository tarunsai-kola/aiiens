const doctorService = require('./doctor.service');
const ApiResponse = require('../../utils/ApiResponse');

class DoctorController {
  async getAll(req, res) {
    const result = await doctorService.getAllDoctors(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Doctors retrieved', result));
  }

  async getOne(req, res) {
    const doctor = await doctorService.getDoctorById(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Doctor profile retrieved', doctor));
  }
  
  async getByUserId(req, res) {
    const doctor = await doctorService.getDoctorByUserId(req.params.userId, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Doctor profile retrieved', doctor));
  }

  async create(req, res) {
    const doctor = await doctorService.createDoctor(req.body, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Doctor profile created', doctor));
  }

  async update(req, res) {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Doctor profile updated', doctor));
  }

  async delete(req, res) {
    await doctorService.deleteDoctor(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Doctor profile deleted successfully'));
  }
}

module.exports = new DoctorController();
