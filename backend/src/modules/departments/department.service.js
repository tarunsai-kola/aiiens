const departmentRepository = require('./department.repository');
const ApiError = require('../../utils/ApiError');

class DepartmentService {
  async getAllDepartments(hospitalId, queryParams) {
    return departmentRepository.findAll(hospitalId, queryParams);
  }

  async getDepartmentById(id, hospitalId) {
    const department = await departmentRepository.findById(id, hospitalId);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }
    return department;
  }

  async createDepartment(data, hospitalId) {
    const exists = await departmentRepository.checkNameExists(data.name, hospitalId);
    if (exists) {
      throw ApiError.conflict('A department with this name already exists');
    }

    return departmentRepository.create({ ...data, hospitalId });
  }

  async updateDepartment(id, data, hospitalId) {
    if (data.name) {
      const exists = await departmentRepository.checkNameExists(data.name, hospitalId, id);
      if (exists) {
        throw ApiError.conflict('A department with this name already exists');
      }
    }

    const department = await departmentRepository.update(id, hospitalId, data);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }
    return department;
  }

  async deleteDepartment(id, hospitalId) {
    // In a real app, you might check if there are users/doctors assigned to this department
    // before allowing deletion. For now, we allow soft/hard deletion depending on requirements.
    const department = await departmentRepository.delete(id, hospitalId);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }
    return department;
  }
}

module.exports = new DepartmentService();
