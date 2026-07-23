// const { Ward } = require('./ward.model');

// TODO: Implement ward repository methods
class WardRepository {
  async findAll()       { return []; }
  async findById(id)    { return null; }
  async create(data)    { return null; }
  async update(id, d)   { return null; }
  async softDelete(id)  { return null; }
}

module.exports = new WardRepository();
