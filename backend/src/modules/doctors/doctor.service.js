const doctorRepository = require('./doctor.repository');
const ApiError = require('../../utils/ApiError');

class DoctorService {
  async getAllDoctors(hospitalId, queryParams) {
    return doctorRepository.findAll(hospitalId, queryParams);
  }

  async getDoctorById(id, hospitalId) {
    const doctor = await doctorRepository.findById(id, hospitalId);
    if (!doctor) throw ApiError.notFound('Doctor profile not found');
    return doctor;
  }
  
  async getDoctorByUserId(userId, hospitalId) {
    const doctor = await doctorRepository.findByUserId(userId, hospitalId);
    if (!doctor) throw ApiError.notFound('Doctor profile not found for this user');
    return doctor;
  }

  async createDoctor(data, hospitalId) {
    // Ensure profile doesn't already exist for this user
    const existing = await doctorRepository.findByUserId(data.userId, hospitalId);
    if (existing) {
      throw ApiError.conflict('Doctor profile already exists for this user');
    }
    
    return doctorRepository.create({ ...data, hospitalId });
  }

  async updateDoctor(id, data, hospitalId) {
    const doctor = await doctorRepository.update(id, hospitalId, data);
    if (!doctor) throw ApiError.notFound('Doctor profile not found');
    return doctor;
  }

  async deleteDoctor(id, hospitalId) {
    const doctor = await doctorRepository.delete(id, hospitalId);
    if (!doctor) throw ApiError.notFound('Doctor profile not found');
    return doctor;
  }
}

module.exports = new DoctorService();
