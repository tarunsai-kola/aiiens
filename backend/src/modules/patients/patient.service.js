const patientRepository = require('./patient.repository');
const ApiError = require('../../utils/ApiError');

class PatientService {
  async getAllPatients(hospitalId, queryParams) {
    return patientRepository.findAll(hospitalId, queryParams);
  }

  async getPatientById(id, hospitalId) {
    const patient = await patientRepository.findById(id, hospitalId);
    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }
    return patient;
  }
  
  async searchPatients(query, hospitalId) {
    if (!query) throw ApiError.badRequest('Search query is required');
    return patientRepository.searchByQuery(query, hospitalId);
  }

  async generateUHID(hospitalId) {
    // Basic implementation: Prefix with 'H' + slice of hospitalId + YYMM + sequence
    // A robust version would use an atomic counter collection (e.g., Sequence model).
    // For this boilerplate, we'll use count + 1 with timestamp elements.
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await patientRepository.countByHospital(hospitalId);
    const seq = String(count + 1).padStart(4, '0');
    
    // E.g., HMS-2607-0001
    return `HMS-${yy}${mm}-${seq}`;
  }

  async createPatient(data, hospitalId) {
    // Check identifiers
    const existing = await patientRepository.checkIdentifiers(hospitalId, data);
    if (existing) {
      if (existing.aadhaar === data.aadhaar) throw ApiError.conflict('Patient with this Aadhaar already exists');
      if (existing.abha === data.abha) throw ApiError.conflict('Patient with this ABHA already exists');
    }

    const uhid = await this.generateUHID(hospitalId);

    return patientRepository.create({
      ...data,
      uhid,
      hospitalId,
    });
  }

  async updatePatient(id, data, hospitalId) {
    const existing = await patientRepository.checkIdentifiers(hospitalId, data, id);
    if (existing) {
      if (data.aadhaar && existing.aadhaar === data.aadhaar) throw ApiError.conflict('Another patient with this Aadhaar already exists');
      if (data.abha && existing.abha === data.abha) throw ApiError.conflict('Another patient with this ABHA already exists');
    }

    const patient = await patientRepository.update(id, hospitalId, data);
    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }
    return patient;
  }

  async deletePatient(id, hospitalId) {
    const patient = await patientRepository.delete(id, hospitalId);
    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }
    return patient;
  }
}

module.exports = new PatientService();
