const Notification = require('./notification.model');
const { getIO } = require('../../utils/socket');

class NotificationService {
  
  /**
   * Universal sender method
   * @param {Object} data - { hospitalId, recipientId, recipientModel, channel, contactDetail, title, message, metadata }
   */
  async send(data) {
    // 1. Log to DB as pending
    const notification = await Notification.create({
      ...data,
      status: 'pending'
    });

    try {
      // 2. Dispatch to correct provider
      if (data.channel === 'sms') {
        await this._mockSendSMS(data.contactDetail, data.message);
      } else if (data.channel === 'email') {
        await this._mockSendEmail(data.contactDetail, data.title, data.message);
      } else if (data.channel === 'whatsapp') {
        await this._mockSendWhatsApp(data.contactDetail, data.message);
      } else if (data.channel === 'in_app') {
        this._sendInApp(data.recipientId, data.title, data.message, data.metadata);
      }

      // 3. Mark as sent
      notification.status = 'sent';
      await notification.save();
      return notification;
    } catch (err) {
      // Mark as failed
      notification.status = 'failed';
      await notification.save();
      console.error(`[NotificationService] Failed to send ${data.channel}:`, err.message);
      return notification;
    }
  }

  // --- MOCK PROVIDERS ---
  
  async _mockSendSMS(phone, message) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`\n[MOCK SMS] To: ${phone} | Message: ${message}\n`);
    // Throw error if mock fails (e.g., bad phone)
    if (!phone) throw new Error('Phone number missing');
    return true;
  }

  async _mockSendEmail(email, subject, body) {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`\n[MOCK EMAIL] To: ${email} | Subject: ${subject}\nBody: ${body}\n`);
    if (!email) throw new Error('Email address missing');
    return true;
  }

  async _mockSendWhatsApp(phone, message) {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`\n[MOCK WHATSAPP] To: ${phone} | Message: ${message}\n`);
    if (!phone) throw new Error('Phone number missing');
    return true;
  }

  _sendInApp(userId, title, message, metadata) {
    try {
      const io = getIO();
      // Emit to a specific room named after the user's ID
      // Requires clients to join their user room upon connect
      io.to(userId.toString()).emit('notification', {
        title,
        message,
        metadata,
        timestamp: new Date()
      });
      console.log(`\n[SOCKET NOTIFICATION] Sent to Room: ${userId}\n`);
    } catch (err) {
      console.log(`[SOCKET NOTIFICATION] Failed (Socket not initialized or user offline):`, err.message);
    }
  }


  // --- READ QUERIES ---

  async getUserNotifications(recipientId, hospitalId) {
    return Notification.find({ recipientId, hospitalId, channel: 'in_app' })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async getAdminLogs(hospitalId, filters = {}) {
    return Notification.find({ hospitalId, ...filters })
      .sort({ createdAt: -1 })
      .limit(100);
  }

  async markAsRead(notificationId) {
    return Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
  }
}

module.exports = new NotificationService();
