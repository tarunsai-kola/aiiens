const roleService = require('./role.service');
const ApiResponse = require('../../utils/ApiResponse');

class RoleController {
  async getAll(req, res) {
    const roles = await roleService.getAllRoles(req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Roles retrieved', roles));
  }

  async getOne(req, res) {
    const role = await roleService.getRoleById(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Role retrieved', role));
  }

  async create(req, res) {
    const role = await roleService.createRole(req.body, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Role created', role));
  }

  async update(req, res) {
    const role = await roleService.updateRole(req.params.id, req.body, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Role updated', role));
  }

  async delete(req, res) {
    await roleService.deleteRole(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Role deleted successfully'));
  }

  async getPermissions(req, res) {
    const permissions = await roleService.getAllPermissions();
    res.status(200).json(ApiResponse.success('Permissions retrieved', permissions));
  }
}

module.exports = new RoleController();
