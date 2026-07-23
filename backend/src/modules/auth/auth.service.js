const authRepository          = require('./auth.repository');
const { comparePassword }     = require('../../utils/hashPassword');
const { generateAccessToken, generateRefreshToken } = require('../../utils/generateToken');
const { generateSecureToken, hashToken } = require('../../utils/cryptoToken');
const emailService            = require('../../utils/emailService');
const ApiError                = require('../../utils/ApiError');
const { Role }                = require('../roles/role.model');
const jwt                     = require('jsonwebtoken');
const jwtConfig               = require('../../config/jwt');
const logger                  = require('../../config/logger');

const MAX_LOGIN_ATTEMPTS  = 5;
const LOCK_DURATION_MS    = 15 * 60 * 1000;       // 15 minutes
const RESET_TOKEN_TTL_MS  = 60 * 60 * 1000;       // 1 hour
const INVITE_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;  // 48 hours
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;  // 24 hours

class AuthService {
  // ── 1. Login ────────────────────────────────────────────────────────────────
  async login(email, password, hospitalId, ip) {
    const user = await authRepository.findByEmail(email, hospitalId);

    if (!user) {
      // Generic message to prevent email enumeration
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Account lockout check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw ApiError.forbidden(
        `Account locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
      );
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Contact your administrator.');
    }

    // Populate role + permissions
    await user.populate({ path: 'roleId', select: 'name slug permissions', options: { _bypassTenantCheck: true } });

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      const updated = await authRepository.incrementLoginAttempts(user._id, hospitalId);
      if (updated && updated.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        await authRepository.lockAccount(
          user._id, hospitalId,
          new Date(Date.now() + LOCK_DURATION_MS)
        );
        throw ApiError.forbidden('Too many failed attempts. Account locked for 15 minutes.');
      }
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Success — reset lockout
    await Promise.all([
      authRepository.resetLoginAttempts(user._id, hospitalId),
      authRepository.updateLastLogin(user._id, hospitalId, ip),
    ]);

    const tokens = this._generateTokens(user, hospitalId);
    await authRepository.updateRefreshToken(user._id, hospitalId, tokens.refreshToken);

    return { user, ...tokens };
  }

  // ── 2. Logout ───────────────────────────────────────────────────────────────
  async logout(userId, hospitalId) {
    await authRepository.updateRefreshToken(userId, hospitalId, null);
  }

  // ── 3. Refresh Token ────────────────────────────────────────────────────────
  async refreshToken(rawRefreshToken, hospitalId) {
    if (!rawRefreshToken) throw ApiError.unauthorized('Refresh token is required');

    let decoded;
    try {
      decoded = jwt.verify(rawRefreshToken, jwtConfig.refreshToken.secret);
    } catch (err) {
      throw ApiError.unauthorized(
        err.name === 'TokenExpiredError'
          ? 'Refresh token expired. Please log in again.'
          : 'Invalid refresh token'
      );
    }

    const user = await authRepository
      .findById(decoded.id, hospitalId);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or account deactivated');
    }

    await user.populate({ path: 'roleId', select: 'name slug permissions', options: { _bypassTenantCheck: true } });

    const tokens = this._generateTokens(user, hospitalId);
    await authRepository.updateRefreshToken(user._id, hospitalId, tokens.refreshToken);

    return { user, ...tokens };
  }

  // ── 4. Get Profile ──────────────────────────────────────────────────────────
  async getProfile(userId, hospitalId) {
    const user = await authRepository.findById(userId, hospitalId);
    if (!user) throw ApiError.notFound('User not found');
    await user.populate({ path: 'roleId', select: 'name slug description permissions', options: { _bypassTenantCheck: true } });
    return user;
  }

  // ── 5. Forgot Password ──────────────────────────────────────────────────────
  async forgotPassword(email, hospitalId) {
    const user = await authRepository.findByEmail(email, hospitalId);

    // Always return success to prevent email enumeration
    if (!user || !user.isActive) {
      logger.info(`Forgot password: user not found or inactive for email ${email}`);
      return;
    }

    const { rawToken, hashedToken, expiresAt } = generateSecureToken(32, RESET_TOKEN_TTL_MS);

    await authRepository.setPasswordResetToken(user._id, hospitalId, hashedToken, expiresAt);

    const resetUrl = `${process.env.PASSWORD_RESET_URL}/${rawToken}?hospitalId=${hospitalId}`;

    // ── DEV MODE: log reset link when email is not configured ────────────────
    if (!process.env.SMTP_USER) {
      console.log('\n' + '═'.repeat(60));
      console.log('  🔑 DEV MODE — PASSWORD RESET LINK (no email configured)');
      console.log('═'.repeat(60));
      console.log(`  User  : ${user.email}`);
      console.log(`  Link  : ${resetUrl}`);
      console.log('═'.repeat(60) + '\n');
    }

    // Fetch hospital name for email template
    const { Hospital } = require('../../models/Hospital.model');
    const hospital = await Hospital.findById(hospitalId).select('name').lean();

    try {
      await emailService.sendPasswordReset({
        to:           user.email,
        name:         user.firstName,
        resetUrl,
        hospitalName: hospital?.name || 'HMS',
      });
      logger.info(`Password reset email sent to ${email}`);
    } catch (emailErr) {
      logger.warn(`Email not sent (check SMTP config): ${emailErr.message}`);
    }
  }

  // ── 6. Reset Password ───────────────────────────────────────────────────────
  async resetPassword(rawToken, hospitalId, newPassword) {
    const hashedToken = hashToken(rawToken);

    const user = await authRepository.findByPasswordResetToken(hashedToken, hospitalId);

    if (!user) {
      throw ApiError.badRequest('Password reset link is invalid or has expired. Please request a new one.');
    }

    // Update password, clear reset token
    user.password                = newPassword; // pre-save hook hashes it
    user.passwordResetToken      = undefined;
    user.passwordResetExpires    = undefined;
    user.passwordChangedAt       = new Date();
    // Invalidate all existing refresh tokens by clearing stored token
    user.refreshToken            = undefined;
    await user.save();

    logger.info(`Password reset successful for user ${user._id}`);
  }

  // ── 7. Change Password (authenticated) ─────────────────────────────────────
  async changePassword(userId, hospitalId, currentPassword, newPassword) {
    const user = await authRepository.findByIdWithPassword(userId, hospitalId);
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    user.password             = newPassword; // pre-save hook hashes it
    user.passwordChangedAt    = new Date();
    user.refreshToken         = undefined;   // Force re-login on all devices
    await user.save();
  }

  // ── 8. Invite Staff ─────────────────────────────────────────────────────────
  async inviteStaff({ email, firstName, lastName, roleId, hospitalId, inviterId }) {
    // Validate role exists and is accessible to this hospital
    const role = await Role.findOne({
      _id: roleId,
      $or: [{ hospitalId }, { type: 'system' }],
    });
    if (!role) throw ApiError.badRequest('Invalid role specified');

    // Check if user already exists in this hospital
    const exists = await authRepository.emailExists(email, hospitalId);
    if (exists) {
      throw ApiError.conflict('A user with this email already exists in this hospital');
    }

    const { rawToken, hashedToken, expiresAt } = generateSecureToken(32, INVITE_TOKEN_TTL_MS);

    // Create pending user with invite token
    // Explicitly omit employeeId so the sparse unique index is not triggered
    const { employeeId: _omit, ...inviteData } = {
      hospitalId,
      firstName,
      lastName,
      email,
      roleId,
      password:      hashedToken, // Placeholder until user sets it
      inviteToken:   hashedToken,
      inviteExpires: expiresAt,
      isActive:      false,       // Inactive until invite accepted
      isEmailVerified: false,
    };
    await authRepository.createPendingInvite(inviteData);

    const inviteUrl = `${process.env.INVITE_ACCEPT_URL}/${rawToken}?hospitalId=${hospitalId}`;

    // ── DEV MODE: log invite link when email is not configured ───────────────
    if (!process.env.SMTP_USER) {
      console.log('\n' + '═'.repeat(60));
      console.log('  📧 DEV MODE — STAFF INVITE LINK (no email configured)');
      console.log('═'.repeat(60));
      console.log(`  Name  : ${firstName} ${lastName}`);
      console.log(`  Email : ${email}`);
      console.log(`  Role  : ${role.name}`);
      console.log(`  Link  : ${inviteUrl}`);
      console.log('═'.repeat(60) + '\n');
    }

    // Get hospital name + inviter name for email
    const { Hospital } = require('../../models/Hospital.model');
    const [hospital, inviter] = await Promise.all([
      Hospital.findById(hospitalId).select('name').lean(),
      authRepository.findById(inviterId, hospitalId),
    ]);

    try {
      await emailService.sendStaffInvite({
        to:           email,
        inviterName:  inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Admin',
        role:         role.name,
        inviteUrl,
        hospitalName: hospital?.name || 'HMS',
      });
    } catch (emailErr) {
      logger.warn(`Invite email not sent (check SMTP config): ${emailErr.message}`);
    }

    logger.info(`Staff invite created for ${email} (hospital ${hospitalId})`);
    return { email, role: role.name };
  }

  // ── 9. Accept Invite ────────────────────────────────────────────────────────
  async acceptInvite(rawToken, hospitalId, { password, phone }) {
    const hashedToken = hashToken(rawToken);

    console.log('Computed hashedToken in service:', hashedToken);

    const user = await authRepository.findByInviteToken(hashedToken, hospitalId);
    if (!user) {
      console.log('DEBUG: User not found for hashedToken:', hashedToken, 'hospitalId:', hospitalId);
      // Let's manually check DB for this user
      const db = require('mongoose').connection.db;
      if (db) {
        const u = await db.collection('users').findOne({ inviteToken: hashedToken });
        console.log('DEBUG: Manual DB lookup by hashedToken only:', !!u);
        if (u) {
          console.log('DEBUG: User hospitalId in DB:', u.hospitalId.toString(), 'Query hospitalId:', hospitalId);
          console.log('DEBUG: User inviteExpires:', u.inviteExpires, 'Now:', new Date());
        }
      }
      throw ApiError.badRequest('Invitation link is invalid or has expired.');
    }

    user.password        = password; // pre-save hashes it
    user.phone           = phone;
    user.isActive        = true;
    user.isEmailVerified = true;
    user.inviteToken     = undefined;
    user.inviteExpires   = undefined;
    await user.save();

    await user.populate({ path: 'roleId', select: 'name slug permissions' });

    const tokens = this._generateTokens(user, hospitalId);
    await authRepository.updateRefreshToken(user._id, hospitalId, tokens.refreshToken);

    return { user, ...tokens };
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _generateTokens(user, hospitalId) {
    const permissions = user.roleId?.permissions || [];
    const payload = {
      id:          user._id,
      hospitalId:  hospitalId || user.hospitalId,
      role:        user.roleId?.slug   || 'unknown',
      email:       user.email,
      permissions,
    };
    return {
      accessToken:  generateAccessToken(payload),
      refreshToken: generateRefreshToken({ id: user._id, hospitalId: payload.hospitalId }),
    };
  }
}

module.exports = new AuthService();
