const express    = require('express');
const router     = express.Router();

const authController = require('./auth.controller');
const { authenticate }  = require('../../middlewares/auth.middleware');
const { authorize }     = require('../../middlewares/rbac.middleware');
const validate          = require('../../middlewares/validate.middleware');
const asyncHandler      = require('../../middlewares/asyncHandler');

const {
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  inviteStaffSchema,
  acceptInviteSchema,
} = require('./auth.validator');

// ── Public Routes (no auth required) ─────────────────────────────────────────

// POST /api/v1/auth/login
router.post('/login',
  validate(loginSchema),
  asyncHandler(authController.login.bind(authController))
);

// POST /api/v1/auth/refresh-token
router.post('/refresh-token',
  validate(refreshTokenSchema),
  asyncHandler(authController.refreshToken.bind(authController))
);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword.bind(authController))
);

// POST /api/v1/auth/reset-password/:token
// Query: ?hospitalId=<id>
router.post('/reset-password/:token',
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword.bind(authController))
);

// POST /api/v1/auth/accept-invite/:token
// Query: ?hospitalId=<id>
router.post('/accept-invite/:token',
  validate(acceptInviteSchema),
  asyncHandler(authController.acceptInvite.bind(authController))
);

// ── Protected Routes (JWT required) ──────────────────────────────────────────

// POST /api/v1/auth/logout
router.post('/logout',
  authenticate,
  asyncHandler(authController.logout.bind(authController))
);

// GET /api/v1/auth/me
router.get('/me',
  authenticate,
  asyncHandler(authController.getProfile.bind(authController))
);

// POST /api/v1/auth/change-password
router.post('/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword.bind(authController))
);

// POST /api/v1/auth/invite-staff  (admin only)
router.post('/invite-staff',
  authenticate,
  authorize('admin'),
  validate(inviteStaffSchema),
  asyncHandler(authController.inviteStaff.bind(authController))
);

module.exports = router;
