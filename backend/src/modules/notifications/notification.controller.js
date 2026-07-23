const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/ApiResponse');

class NotificationController {
  async getMyNotifications(req, res) {
    const notifications = await notificationService.getUserNotifications(req.user.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Notifications retrieved', notifications));
  }

  async markAsRead(req, res) {
    const notification = await notificationService.markAsRead(req.params.id);
    res.status(200).json(ApiResponse.success('Notification marked as read', notification));
  }

  async getAdminLogs(req, res) {
    const logs = await notificationService.getAdminLogs(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Notification logs retrieved', logs));
  }
}

module.exports = new NotificationController();
