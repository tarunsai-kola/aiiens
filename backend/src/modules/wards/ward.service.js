const ApiError = require('../../utils/ApiError');
// const wardRepository = require('./ward.repository');

// TODO: Implement ward business logic
class WardService {
  async getAll(query)    { throw ApiError.internal('Not implemented yet'); }
  async getById(id)      { throw ApiError.internal('Not implemented yet'); }
  async create(data)     { throw ApiError.internal('Not implemented yet'); }
  async update(id, data) { throw ApiError.internal('Not implemented yet'); }
  async delete(id)       { throw ApiError.internal('Not implemented yet'); }
}

module.exports = new WardService();
