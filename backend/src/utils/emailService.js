const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/**
 * EmailService — Nodemailer-based email delivery.
 *
 * Supports SMTP (dev/staging) and can be swapped for SendGrid/AWS SES in production
 * by changing the transporter configuration via environment variables.
 *
 * All template methods return promises. Call them from the service layer,
 * never from controllers.
 */
class EmailService {
  constructor() {
    this.transporter = this._createTransporter();
    this.fromAddress = process.env.EMAIL_FROM || '"HMS Platform" <noreply@hms.example.com>';
  }

  _createTransporter() {
    // Use Ethereal for development (auto-creates test account)
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      // Ethereal credentials set via env — see setup instructions
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER || '',
          pass: process.env.ETHEREAL_PASS || '',
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Core send method.
   * @param {{ to, subject, html, text }} options
   */
  async send({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from:    this.fromAddress,
        to,
        subject,
        html,
        text:    text || this._stripHtml(html),
      });

      if (process.env.NODE_ENV === 'development') {
        logger.info(`📧 Email sent. Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return info;
    } catch (err) {
      logger.error('EmailService send error:', err.message);
      // Don't throw — email failure should not crash the API response
      // In production, implement retry via a queue (Bull/BullMQ)
    }
  }

  // ── Email Templates ─────────────────────────────────────────────────────────

  /**
   * Password reset email.
   * @param {{ to, name, resetUrl, hospitalName }} opts
   */
  async sendPasswordReset({ to, name, resetUrl, hospitalName }) {
    await this.send({
      to,
      subject: `Reset your password — ${hospitalName}`,
      html: this._passwordResetTemplate({ name, resetUrl, hospitalName }),
    });
  }

  /**
   * Staff invitation email.
   * @param {{ to, inviterName, role, inviteUrl, hospitalName, expiresIn }} opts
   */
  async sendStaffInvite({ to, inviterName, role, inviteUrl, hospitalName, expiresIn = '48 hours' }) {
    await this.send({
      to,
      subject: `You've been invited to join ${hospitalName} — HMS`,
      html: this._staffInviteTemplate({ to, inviterName, role, inviteUrl, hospitalName, expiresIn }),
    });
  }

  /**
   * Welcome email after hospital registration.
   * @param {{ to, name, hospitalName, loginUrl }} opts
   */
  async sendWelcome({ to, name, hospitalName, loginUrl }) {
    await this.send({
      to,
      subject: `Welcome to HMS — ${hospitalName} is ready!`,
      html: this._welcomeTemplate({ name, hospitalName, loginUrl }),
    });
  }

  /**
   * Email verification.
   * @param {{ to, name, verifyUrl, hospitalName }} opts
   */
  async sendEmailVerification({ to, name, verifyUrl, hospitalName }) {
    await this.send({
      to,
      subject: `Verify your email — ${hospitalName}`,
      html: this._emailVerifyTemplate({ name, verifyUrl, hospitalName }),
    });
  }

  // ── Private HTML Templates ──────────────────────────────────────────────────

  _baseLayout(content, hospitalName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: #bfdbfe; font-size: 14px; margin-top: 4px; }
    .body { padding: 40px; }
    .body h2 { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
    .body p { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 16px; }
    .btn { display: inline-block; padding: 14px 32px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
    .btn:hover { background: #1d4ed8; }
    .link-fallback { font-size: 13px; color: #94a3b8; word-break: break-all; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; }
    .badge { display: inline-block; background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 HMS</h1>
      <p>Hospital Management System</p>
    </div>
    <div class="body">${content}</div>
    <hr class="divider" style="margin: 0;" />
    <div class="footer">
      <p>© ${new Date().getFullYear()} HMS Platform · ${hospitalName}</p>
      <p style="margin-top: 8px;">If you did not request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`;
  }

  _passwordResetTemplate({ name, resetUrl, hospitalName }) {
    return this._baseLayout(`
      <div class="badge">Password Reset</div>
      <h2>Reset your password</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset your password for your HMS account at <strong>${hospitalName}</strong>. Click the button below to set a new password.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <div class="warning">⏱️ This link expires in <strong>1 hour</strong>. If you didn't request this, no action is needed.</div>
      <hr class="divider" />
      <p class="link-fallback">If the button doesn't work, paste this URL into your browser:<br>${resetUrl}</p>
    `, hospitalName);
  }

  _staffInviteTemplate({ to, inviterName, role, inviteUrl, hospitalName, expiresIn }) {
    return this._baseLayout(`
      <div class="badge">Staff Invitation</div>
      <h2>You've been invited!</h2>
      <p>Hi there,</p>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${hospitalName}</strong> on HMS as a <strong>${role}</strong>.</p>
      <p>Click below to accept the invitation and set up your account:</p>
      <a href="${inviteUrl}" class="btn">Accept Invitation</a>
      <div class="warning">⏱️ This invitation expires in <strong>${expiresIn}</strong>.</div>
      <hr class="divider" />
      <p class="link-fallback">If the button doesn't work, paste this URL:<br>${inviteUrl}</p>
    `, hospitalName);
  }

  _welcomeTemplate({ name, hospitalName, loginUrl }) {
    return this._baseLayout(`
      <div class="badge">Welcome!</div>
      <h2>Your hospital is ready 🎉</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Congratulations! <strong>${hospitalName}</strong> has been successfully registered on HMS. Your 14-day free trial has started.</p>
      <p>You can now log in and start managing your hospital:</p>
      <a href="${loginUrl}" class="btn">Go to Dashboard</a>
      <p>If you have any questions, our support team is here to help.</p>
    `, hospitalName);
  }

  _emailVerifyTemplate({ name, verifyUrl, hospitalName }) {
    return this._baseLayout(`
      <div class="badge">Email Verification</div>
      <h2>Verify your email address</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Please verify your email address to complete your registration at <strong>${hospitalName}</strong>.</p>
      <a href="${verifyUrl}" class="btn">Verify Email</a>
      <div class="warning">⏱️ This link expires in <strong>24 hours</strong>.</div>
    `, hospitalName);
  }

  _stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

module.exports = new EmailService();
