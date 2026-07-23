const { Department } = require('./department.model');
const { paginate } = require('../../utils/paginate');

class DepartmentRepository {
  async findAll(hospitalId, queryParams) {
    const filter = { hospitalId };

    if (queryParams.search) {
      filter.name = { $regex: queryParams.search, $options: 'i' };
    }

    if (queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive === 'true';
    }

    const { page, limit, skip } = paginate(queryParams);

    const [docs, total] = await Promise.all([
      Department.find(filter)
        .populate({ path: 'headDoctorId', select: 'userId' })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Department.countDocuments(filter),
    ]);

    return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id, hospitalId) {
    return Department.findOne({ _id: id, hospitalId }).populate('headDoctorId');
  }

  async create(departmentData) {
    const department = new Department(departmentData);
    return department.save();
  }

  async update(id, hospitalId, updateData) {
    return Department.findOneAndUpdate(
      { _id: id, hospitalId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async delete(id, hospitalId) {
    return Department.findOneAndDelete({ _id: id, hospitalId });
  }

  async checkNameExists(name, hospitalId, excludeId = null) {
    const query = { name: new RegExp(`^${name}$`, 'i'), hospitalId };
    if (excludeId) query._id = { $ne: excludeId };
    return Department.exists(query);
  }
}

module.exports = new DepartmentRepository();
