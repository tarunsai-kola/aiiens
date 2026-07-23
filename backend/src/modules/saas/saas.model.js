const mongoose = require('mongoose');

// --- SAAS PAYMENT (Global, not scoped to tenantPlugin) ---
const saasPaymentSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  billingCycle: { type: String, enum: ['monthly', 'annually'], required: true },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
  paymentDate: { type: Date, default: Date.now },
  transactionId: { type: String, trim: true }
}, { timestamps: true });

const SaaSPayment = mongoose.model('SaaSPayment', saasPaymentSchema);

// --- SUPPORT TICKET (Global) ---
const supportTicketSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The hospital admin who raised it
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The superadmin who resolved it
  resolutionNotes: { type: String }
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

// --- SYSTEM LOG (Global) ---
const systemLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  module: { type: String, required: true }, // 'Hospital', 'Plan', 'Ticket', 'User'
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Superadmin user
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String }
}, { timestamps: true });

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

module.exports = {
  SaaSPayment,
  SupportTicket,
  SystemLog
};
