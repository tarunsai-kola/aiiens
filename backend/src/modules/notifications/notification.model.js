const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  
  // Can be a Patient or a Staff User
  recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientModel: { type: String, enum: ['User', 'Patient'], required: true },
  
  channel: { type: String, enum: ['sms', 'email', 'whatsapp', 'push', 'in_app'], required: true },
  
  // Destination
  contactDetail: { type: String }, // Phone number or email address
  
  title: { type: String },
  message: { type: String, required: true },
  
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  
  // For in-app notifications
  isRead: { type: Boolean, default: false },
  
  // To link to specific entities (e.g. appointment ID, bill ID)
  metadata: { type: mongoose.Schema.Types.Mixed }
  
}, { timestamps: true });

// Optional: we can apply tenantPlugin if we want strictly hospital-scoped notifications
const tenantPlugin = require('../../plugins/tenantPlugin');
notificationSchema.plugin(tenantPlugin);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
