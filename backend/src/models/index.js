/**
 * models/index.js — Central export for all global (non-tenant) models.
 * Import from here to avoid scattered relative paths throughout the codebase.
 *
 * Usage:
 *   const { Hospital, SubscriptionPlan, Permission } = require('../models');
 */

const { Hospital }         = require('./Hospital.model');
const { SubscriptionPlan } = require('./SubscriptionPlan.model');
const { Permission }       = require('./Permission.model');

module.exports = {
  Hospital,
  SubscriptionPlan,
  Permission,
};
