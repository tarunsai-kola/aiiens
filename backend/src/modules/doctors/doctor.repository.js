const { Doctor } = require('./doctor.model');
const { paginate } = require('../../utils/paginate');

class DoctorRepository {
  async findAll(hospitalId, queryParams) {
    const filter = { hospitalId };

    if (queryParams.departmentId) {
      filter.departmentId = queryParams.departmentId;
    }
    
    if (queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive === 'true';
    }

    const { page, limit, skip } = paginate(queryParams);

    const [docs, total] = await Promise.all([
      Doctor.find(filter)
        .populate({ path: 'userId', select: 'firstName lastName email phone' })
        .populate({ path: 'departmentId', select: 'name' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(filter),
    ]);

    return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id, hospitalId) {
    return Doctor.findOne({ _id: id, hospitalId }).populate('userId', 'firstName lastName email phone').populate('departmentId', 'name');
  }
  
  async findByUserId(userId, hospitalId) {
    return Doctor.findOne({ userId, hospitalId }).populate('userId', 'firstName lastName email phone').populate('departmentId', 'name');
  }

  async create(data) {
    const doctor = new Doctor(data);
    return doctor.save();
  }

  async update(id, hospitalId, data) {
    return Doctor.findOneAndUpdate(
      { _id: id, hospitalId },
      data,
      { new: true, runValidators: true }
    );
  }

  async delete(id, hospitalId) {
    return Doctor.findOneAndDelete({ _id: id, hospitalId });
  }
}

module.exports = new DoctorRepository();
