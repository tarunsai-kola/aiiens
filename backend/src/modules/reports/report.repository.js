// const { Report } = require('./report.model');

// TODO: Implement report repository methods
class ReportRepository {
  async findAll()       { return []; }
  async findById(id)    { return null; }
  async create(data)    { return null; }
  async update(id, d)   { return null; }
  async softDelete(id)  { return null; }
}

module.exports = new ReportRepository();
