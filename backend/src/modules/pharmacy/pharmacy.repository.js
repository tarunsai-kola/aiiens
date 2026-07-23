// const { Pharmacy } = require('./pharmacy.model');

// TODO: Implement pharmacy repository methods
class PharmacyRepository {
  async findAll()       { return []; }
  async findById(id)    { return null; }
  async create(data)    { return null; }
  async update(id, d)   { return null; }
  async softDelete(id)  { return null; }
}

module.exports = new PharmacyRepository();
