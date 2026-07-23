const { User } = require('../auth/auth.model');
const { paginate } = require('../../utils/paginate');
const ApiError = require('../../utils/ApiError');

class StaffService {
  async getAllStaff(hospitalId, queryParams) {
    const filter = { hospitalId };

    if (queryParams.search) {
      filter.$or = [
        { firstName: { $regex: queryParams.search, $options: 'i' } },
        { lastName: { $regex: queryParams.search, $options: 'i' } },
        { email: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    if (queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive === 'true';
    }
    
    if (queryParams.roleId) {
      filter.roleId = queryParams.roleId;
    }

    const { page, limit, skip } = paginate(queryParams);

    const [docs, total] = await Promise.all([
      User.find(filter)
        .populate({ path: 'roleId', select: 'name slug', options: { _bypassTenantCheck: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStaffById(id, hospitalId) {
    const staff = await User.findOne({ _id: id, hospitalId }).populate('roleId', 'name slug');
    if (!staff) {
      throw ApiError.notFound('Staff member not found');
    }
    return staff;
  }

  async updateStaff(id, data, hospitalId) {
    const staff = await User.findOneAndUpdate(
      { _id: id, hospitalId },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('roleId', 'name slug');

    if (!staff) {
      throw ApiError.notFound('Staff member not found');
    }
    return staff;
  }

  async deactivateStaff(id, hospitalId) {
    const staff = await User.findOneAndUpdate(
      { _id: id, hospitalId },
      { isActive: false },
      { new: true }
    );

    if (!staff) {
      throw ApiError.notFound('Staff member not found');
    }
    return staff;
  }

  async activateStaff(id, hospitalId) {
    const staff = await User.findOneAndUpdate(
      { _id: id, hospitalId },
      { isActive: true },
      { new: true }
    );

    if (!staff) {
      throw ApiError.notFound('Staff member not found');
    }
    return staff;
  }
}

module.exports = new StaffService();
