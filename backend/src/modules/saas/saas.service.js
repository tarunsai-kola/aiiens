const { Hospital } = require('../../models/Hospital.model');
const { SubscriptionPlan } = require('../../models/SubscriptionPlan.model');
const { SaaSPayment, SupportTicket, SystemLog } = require('./saas.model');
const { User } = require('../auth/auth.model');
const ApiError = require('../../utils/ApiError');

class SaaSService {
  // --- PLATFORM ANALYTICS ---
  async getPlatformStats() {
    const [hospitalsCount, activeHospitals, mrrData, activeTickets] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ isActive: true, subscriptionStatus: 'active' }),
      
      // Calculate Monthly Recurring Revenue (Mocked by summing all payments in the last 30 days)
      SaaSPayment.aggregate([
        { 
          $match: { 
            status: 'Completed', 
            paymentDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      SupportTicket.countDocuments({ status: { $in: ['Open', 'In Progress'] } })
    ]);

    const mrr = mrrData.length > 0 ? mrrData[0].total : 0;

    return {
      hospitalsCount,
      activeHospitals,
      mrr,
      activeTickets
    };
  }

  // --- HOSPITALS ---
  async getAllHospitals() {
    return Hospital.find().populate('subscriptionPlanId', 'name price').sort({ createdAt: -1 });
  }

  async toggleHospitalStatus(hospitalId, isActive, adminId) {
    const hospital = await Hospital.findByIdAndUpdate(hospitalId, { isActive }, { new: true });
    if (!hospital) throw ApiError.notFound('Hospital not found');

    await SystemLog.create({
      action: isActive ? 'Hospital Activated' : 'Hospital Suspended',
      module: 'Hospital',
      actorId: adminId,
      details: { hospitalId, hospitalName: hospital.name }
    });

    return hospital;
  }

  // --- PLANS ---
  async getSubscriptionPlans() {
    return SubscriptionPlan.find().sort({ sortOrder: 1 });
  }

  async updatePlan(planId, data, adminId) {
    const plan = await SubscriptionPlan.findByIdAndUpdate(planId, data, { new: true });
    
    await SystemLog.create({
      action: 'Plan Updated',
      module: 'Plan',
      actorId: adminId,
      details: { planId, planName: plan.name }
    });

    return plan;
  }

  // --- SUPPORT TICKETS ---
  async getTickets() {
    return SupportTicket.find()
      .populate('hospitalId', 'name')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async updateTicketStatus(ticketId, status, resolutionNotes, adminId) {
    return SupportTicket.findByIdAndUpdate(ticketId, {
      status,
      resolutionNotes,
      resolvedBy: adminId
    }, { new: true });
  }

  // --- SYSTEM LOGS ---
  async getSystemLogs() {
    return SystemLog.find()
      .populate('actorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
  }
}

module.exports = new SaaSService();
