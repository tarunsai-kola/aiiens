// const { Laboratory } = require('./laboratory.model');

// TODO: Implement laboratory repository methods
class LaboratoryRepository {
  async findAll()       { return []; }
  async findById(id)    { return null; }
  async create(data)    { return null; }
  async update(id, d)   { return null; }
  async softDelete(id)  { return null; }
}

module.exports = new LaboratoryRepository();
