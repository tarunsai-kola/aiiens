const { Patient } = require('./patient.model');
const { paginate } = require('../../utils/paginate');

class PatientRepository {
  async findAll(hospitalId, queryParams) {
    const filter = { hospitalId };

    if (queryParams.search) {
      filter.$or = [
        { firstName: { $regex: queryParams.search, $options: 'i' } },
        { lastName: { $regex: queryParams.search, $options: 'i' } },
        { phone: { $regex: queryParams.search, $options: 'i' } },
        { uhid: { $regex: queryParams.search, $options: 'i' } },
      ];
    }
    
    if (queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive === 'true';
    }

    const { page, limit, skip } = paginate(queryParams);

    const [docs, total] = await Promise.all([
      Patient.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(filter),
    ]);

    return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  
  async searchByQuery(query, hospitalId) {
    // Exact match search for Phone, UHID, Aadhaar, ABHA
    return Patient.find({
      hospitalId,
      $or: [
        { phone: query },
        { uhid: new RegExp(`^${query}$`, 'i') },
        { aadhaar: query },
        { abha: query },
      ]
    }).sort({ createdAt: -1 });
  }

  async findById(id, hospitalId) {
    return Patient.findOne({ _id: id, hospitalId });
  }

  async create(patientData) {
    const patient = new Patient(patientData);
    return patient.save();
  }

  async update(id, hospitalId, updateData) {
    return Patient.findOneAndUpdate(
      { _id: id, hospitalId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async delete(id, hospitalId) {
    return Patient.findOneAndDelete({ _id: id, hospitalId });
  }

  async countByHospital(hospitalId) {
    return Patient.countDocuments({ hospitalId });
  }
  
  async checkIdentifiers(hospitalId, { aadhaar, abha, phone }, excludeId = null) {
    const orConditions = [];
    if (aadhaar) orConditions.push({ aadhaar });
    if (abha) orConditions.push({ abha });
    // Phone might not strictly be unique per patient (e.g. child uses parent's phone)
    // We only enforce uniqueness on aadhaar and abha.
    
    if (orConditions.length === 0) return null;
    
    const query = { hospitalId, $or: orConditions };
    if (excludeId) query._id = { $ne: excludeId };
    
    return Patient.findOne(query);
  }
}

module.exports = new PatientRepository();
