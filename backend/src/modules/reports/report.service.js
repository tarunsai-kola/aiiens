const ApiError = require('../../utils/ApiError');
// const reportRepository = require('./report.repository');

// TODO: Implement report business logic
class ReportService {
  async getAll(query)    { throw ApiError.internal('Not implemented yet'); }
  async getById(id)      { throw ApiError.internal('Not implemented yet'); }
  async create(data)     { throw ApiError.internal('Not implemented yet'); }
  async update(id, data) { throw ApiError.internal('Not implemented yet'); }
  async delete(id)       { throw ApiError.internal('Not implemented yet'); }
}

module.exports = new ReportService();
