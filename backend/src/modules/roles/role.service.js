const { Role } = require('./role.model');
const { Permission } = require('../../models/Permission.model'); // Global model
const ApiError = require('../../utils/ApiError');

class RoleService {
  async getAllRoles(hospitalId) {
    // Return custom roles for this hospital OR system roles
    // System roles have hospitalId: null, so we bypass the TenantPlugin check
    return Role.find(
      { $or: [{ hospitalId }, { type: 'system' }] },
      null,
      { _bypassTenantCheck: true }
    ).sort({ type: -1, name: 1 }); // System roles first
  }

  async getRoleById(id, hospitalId) {
    const role = await Role.findOne({
      _id: id,
      $or: [{ hospitalId }, { type: 'system' }]
    });
    if (!role) throw ApiError.notFound('Role not found');
    return role;
  }

  async createRole(data, hospitalId) {
    // Ensure name is unique per hospital
    const exists = await Role.exists({ name: new RegExp(`^${data.name}$`, 'i'), hospitalId });
    if (exists) throw ApiError.conflict('A role with this name already exists');

    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const role = new Role({
      ...data,
      slug,
      hospitalId,
      type: 'custom',
    });
    return role.save();
  }

  async updateRole(id, data, hospitalId) {
    // Only allow updating custom roles belonging to this hospital
    const role = await Role.findOne({ _id: id, hospitalId, type: 'custom' });
    if (!role) throw ApiError.notFound('Custom role not found or cannot be edited');

    if (data.name && data.name !== role.name) {
      const exists = await Role.exists({ name: new RegExp(`^${data.name}$`, 'i'), hospitalId, _id: { $ne: id } });
      if (exists) throw ApiError.conflict('A role with this name already exists');
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    Object.assign(role, data);
    return role.save();
  }

  async deleteRole(id, hospitalId) {
    const role = await Role.findOneAndDelete({ _id: id, hospitalId, type: 'custom' });
    if (!role) throw ApiError.notFound('Custom role not found or cannot be deleted');
    return role;
  }

  async getAllPermissions() {
    return Permission.find({}).sort({ module: 1, action: 1 });
  }
}

module.exports = new RoleService();
