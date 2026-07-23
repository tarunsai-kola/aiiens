const { LabTestMaster, LabOrder } = require('./laboratory.model');
const ApiError = require('../../utils/ApiError');

class LaboratoryService {
  // --- TEST MASTER BLUEPRINTS ---
  async createTestMaster(data, hospitalId) {
    return LabTestMaster.create({ ...data, hospitalId });
  }

  async getTestMasters(hospitalId) {
    return LabTestMaster.find({ hospitalId }).sort({ name: 1 });
  }

  // --- LAB ORDERS WORKFLOW ---
  async createLabOrder(data, hospitalId, doctorId) {
    return LabOrder.create({
      ...data,
      hospitalId,
      doctorId, // Who referred/ordered it
      status: 'ordered'
    });
  }

  async getLabOrders(hospitalId, filters = {}) {
    return LabOrder.find({ hospitalId, ...filters })
      .populate('patientId', 'firstName lastName uhid age gender')
      .populate('doctorId', 'firstName lastName')
      .populate('testId', 'name code parameters')
      .populate('collectedBy', 'firstName lastName')
      .populate('technicianId', 'firstName lastName')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async getLabOrderById(id, hospitalId) {
    const order = await LabOrder.findOne({ _id: id, hospitalId })
      .populate('patientId', 'firstName lastName uhid age gender')
      .populate('doctorId', 'firstName lastName')
      .populate('testId')
      .populate('collectedBy', 'firstName lastName')
      .populate('technicianId', 'firstName lastName')
      .populate('verifiedBy', 'firstName lastName');
    
    if (!order) throw ApiError.notFound('Lab Order not found');
    return order;
  }

  // Workflow Triggers
  async collectSample(orderId, userId, hospitalId) {
    const order = await LabOrder.findOneAndUpdate(
      { _id: orderId, hospitalId, status: 'ordered' },
      { 
        status: 'sample_collected', 
        collectedBy: userId, 
        sampleCollectionTime: new Date() 
      },
      { new: true }
    );
    if (!order) throw ApiError.badRequest('Order not found or invalid status transition');
    return order;
  }

  async uploadResults(orderId, resultsData, userId, hospitalId) {
    // resultsData expected: { results: [{ parameterName, value, isAbnormal }], reportNotes }
    const order = await LabOrder.findOneAndUpdate(
      { _id: orderId, hospitalId, status: 'sample_collected' },
      { 
        status: 'completed', 
        technicianId: userId, 
        resultEntryTime: new Date(),
        results: resultsData.results,
        reportNotes: resultsData.reportNotes
      },
      { new: true }
    );
    if (!order) throw ApiError.badRequest('Order not found or invalid status transition');
    return order;
  }

  async verifyReport(orderId, userId, hospitalId) {
    const order = await LabOrder.findOneAndUpdate(
      { _id: orderId, hospitalId, status: 'completed' },
      { 
        status: 'verified', 
        verifiedBy: userId, 
        verificationTime: new Date() 
      },
      { new: true }
    );
    if (!order) throw ApiError.badRequest('Order not found or already verified');
    return order;
  }
}

module.exports = new LaboratoryService();
