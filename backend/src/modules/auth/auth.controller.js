const authService  = require('./auth.service');
const ApiResponse  = require('../../utils/ApiResponse');

/**
 * AuthController — Pure HTTP layer.
 * Extracts request data → calls service → sends response.
 * ZERO business logic lives here.
 */
class AuthController {

  // POST /api/v1/auth/login
  async login(req, res) {
    const { email, password, hospitalId } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const result = await authService.login(email, password, hospitalId, ip);

    res.status(200).json(ApiResponse.success('Login successful', {
      user:         result.user,
      accessToken:  result.accessToken,
      refreshToken: result.refreshToken,
    }));
  }

  // POST /api/v1/auth/logout
  async logout(req, res) {
    await authService.logout(req.user.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Logged out successfully'));
  }

  // POST /api/v1/auth/refresh-token
  async refreshToken(req, res) {
    const { refreshToken, hospitalId } = req.body;
    const result = await authService.refreshToken(refreshToken, hospitalId);

    res.status(200).json(ApiResponse.success('Token refreshed', {
      accessToken:  result.accessToken,
      refreshToken: result.refreshToken,
      user:         result.user,
    }));
  }

  // GET /api/v1/auth/me
  async getProfile(req, res) {
    const user = await authService.getProfile(req.user.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Profile retrieved', user));
  }

  // POST /api/v1/auth/forgot-password
  async forgotPassword(req, res) {
    const { email, hospitalId } = req.body;
    await authService.forgotPassword(email, hospitalId);

    // Always return 200 regardless of whether email exists (prevent enumeration)
    res.status(200).json(ApiResponse.success(
      'If an account with that email exists, a password reset link has been sent.'
    ));
  }

  // POST /api/v1/auth/reset-password/:token
  async resetPassword(req, res) {
    const { token }          = req.params;
    const { hospitalId }     = req.query;
    const { password }       = req.body;

    if (!hospitalId) {
      return res.status(400).json(ApiResponse.error('hospitalId is required in query params'));
    }

    await authService.resetPassword(token, hospitalId, password);

    res.status(200).json(ApiResponse.success('Password reset successfully. You can now log in.'));
  }

  // POST /api/v1/auth/change-password
  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(
      req.user.id,
      req.user.hospitalId,
      currentPassword,
      newPassword
    );
    res.status(200).json(ApiResponse.success('Password changed successfully. Please log in again.'));
  }

  // POST /api/v1/auth/invite-staff
  async inviteStaff(req, res) {
    const { email, firstName, lastName, roleId } = req.body;
    const result = await authService.inviteStaff({
      email,
      firstName,
      lastName,
      roleId,
      hospitalId: req.user.hospitalId,
      inviterId:  req.user.id,
    });

    res.status(201).json(ApiResponse.success(
      `Invitation sent to ${result.email} as ${result.role}`,
      result
    ));
  }

  // POST /api/v1/auth/accept-invite/:token
  async acceptInvite(req, res) {
    const { token }      = req.params;
    const { hospitalId } = req.query;
    const { password, phone } = req.body;

    if (!hospitalId) {
      return res.status(400).json(ApiResponse.error('hospitalId is required in query params'));
    }

    console.log('--- DEBUG ACCEPT INVITE ---');
    console.log('Received rawToken in controller:', token);
    console.log('Received hospitalId:', hospitalId);

    const result = await authService.acceptInvite(token, hospitalId, { password, phone });

    res.status(200).json(ApiResponse.success('Invitation accepted. Welcome aboard!', {
      user:         result.user,
      accessToken:  result.accessToken,
      refreshToken: result.refreshToken,
    }));
  }
}

module.exports = new AuthController();
