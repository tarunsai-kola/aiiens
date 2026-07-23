const { User } = require('./auth.model');

/**
 * AuthRepository — Complete data access layer for User collection.
 * Every method is tenant-scoped by hospitalId.
 * Services never touch Mongoose directly.
 */
class AuthRepository {
  // ── Find Methods ─────────────────────────────────────────────────────────────

  async findByEmail(email, hospitalId) {
    return User.findOne({ hospitalId, email })
      .select('+password +refreshToken +loginAttempts +lockUntil');
  }

  async findById(id, hospitalId) {
    return User.findOne({ _id: id, hospitalId });
  }

  async findByIdWithPassword(id, hospitalId) {
    return User.findOne({ _id: id, hospitalId }).select('+password');
  }

  async findByPasswordResetToken(hashedToken, hospitalId) {
    return User.findOne({
      hospitalId,
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: new Date() }, // Not expired
      isActive:             true,
    });
  }

  async findByInviteToken(hashedToken, hospitalId) {
    return User.findOne({
      hospitalId,
      inviteToken:   hashedToken,
      inviteExpires: { $gt: new Date() }, // Not expired
    });
  }

  async findByVerifyToken(hashedToken, hospitalId) {
    return User.findOne({
      hospitalId,
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });
  }

  // ── Create Methods ────────────────────────────────────────────────────────────

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async createPendingInvite(userData) {
    const user = new User(userData);
    return user.save();
  }

  // ── Update Methods ────────────────────────────────────────────────────────────

  async updateRefreshToken(userId, hospitalId, refreshToken) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      { refreshToken },
      { new: true }
    );
  }

  async updateLastLogin(userId, hospitalId, ip) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      { lastLogin: new Date(), lastLoginIp: ip }
    );
  }

  async setPasswordResetToken(userId, hospitalId, hashedToken, expiresAt) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      {
        passwordResetToken:   hashedToken,
        passwordResetExpires: expiresAt,
      },
      { new: true }
    );
  }

  async setEmailVerifyToken(userId, hospitalId, hashedToken, expiresAt) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      {
        emailVerificationToken:   hashedToken,
        emailVerificationExpires: expiresAt,
      },
      { new: true }
    );
  }

  async markEmailVerified(userId, hospitalId) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      {
        isEmailVerified:          true,
        emailVerificationToken:   undefined,
        emailVerificationExpires: undefined,
      },
      { new: true }
    );
  }

  async incrementLoginAttempts(userId, hospitalId) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      { $inc: { loginAttempts: 1 } },
      { new: true, select: '+loginAttempts +lockUntil' }
    );
  }

  async resetLoginAttempts(userId, hospitalId) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
    );
  }

  async lockAccount(userId, hospitalId, lockUntil) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      { lockUntil }
    );
  }

  async deactivate(userId, hospitalId) {
    return User.findOneAndUpdate(
      { _id: userId, hospitalId },
      { isActive: false },
      { new: true }
    );
  }

  // ── Checks ────────────────────────────────────────────────────────────────────

  async emailExists(email, hospitalId) {
    return User.exists({ hospitalId, email });
  }
}

module.exports = new AuthRepository();
