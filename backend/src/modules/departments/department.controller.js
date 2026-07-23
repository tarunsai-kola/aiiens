const departmentService = require('./department.service');
const ApiResponse = require('../../utils/ApiResponse');

class DepartmentController {
  async getAll(req, res) {
    const result = await departmentService.getAllDepartments(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Departments retrieved', result));
  }

  async getOne(req, res) {
    const department = await departmentService.getDepartmentById(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Department retrieved', department));
  }

  async create(req, res) {
    const department = await departmentService.createDepartment(req.body, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Department created', department));
  }

  async update(req, res) {
    const department = await departmentService.updateDepartment(req.params.id, req.body, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Department updated', department));
  }

  async delete(req, res) {
    await departmentService.deleteDepartment(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Department deleted successfully'));
  }
}

module.exports = new DepartmentController();
