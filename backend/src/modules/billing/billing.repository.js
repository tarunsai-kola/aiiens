// const { Billing } = require('./billing.model');

// TODO: Implement billing repository methods
class BillingRepository {
  async findAll()       { return []; }
  async findById(id)    { return null; }
  async create(data)    { return null; }
  async update(id, d)   { return null; }
  async softDelete(id)  { return null; }
}

module.exports = new BillingRepository();
