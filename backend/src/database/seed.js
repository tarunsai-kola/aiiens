/**
 * seed.js — Platform database seeder.
 *
 * Seeds global collections:
 *   1. SubscriptionPlans
 *   2. Permissions
 *   3. System Roles (hospitalId: null)
 *
 * Idempotent: Uses upsert (updateOne + upsert: true).
 * Safe to run multiple times — will not create duplicates.
 *
 * Run with:
 *   node src/database/seed.js
 *   node src/database/seed.js --reset  (drops + re-seeds)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const { SubscriptionPlan } = require('../models/SubscriptionPlan.model');
const { Permission }        = require('../models/Permission.model');
const { Role }              = require('../modules/roles/role.model');

const subscriptionPlanSeeds = require('./subscriptionPlans.seed');
const permissionSeeds       = require('./permissions.seed');
const systemRoleSeeds       = require('./roles.seed');

const logger = console;

// ── Utility ───────────────────────────────────────────────────────────────────
async function upsertMany(Model, items, uniqueKey) {
  const ops = items.map((item) => ({
    updateOne: {
      filter: { [uniqueKey]: item[uniqueKey] },
      update: { $set: item },
      upsert: true,
    },
  }));

  const result = await Model.bulkWrite(ops, { ordered: false });
  return result;
}

// ── Seed Functions ────────────────────────────────────────────────────────────

async function seedSubscriptionPlans() {
  logger.log('\n📦 Seeding Subscription Plans...');
  const result = await upsertMany(SubscriptionPlan, subscriptionPlanSeeds, 'slug');
  logger.log(`   ✅ ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
}

async function seedPermissions() {
  logger.log('\n🔑 Seeding Permissions...');
  const result = await upsertMany(Permission, permissionSeeds, 'slug');
  logger.log(`   ✅ ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
}

async function seedSystemRoles() {
  logger.log('\n👔 Seeding System Roles...');

  const ops = systemRoleSeeds.map((role) => ({
    updateOne: {
      filter: { slug: role.slug, type: 'system' },
      update: { $set: role },
      upsert: true,
    },
  }));

  // Bypass tenant check for system roles (hospitalId: null)
  const result = await Role.bulkWrite(ops, { ordered: false });
  logger.log(`   ✅ ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);
}

async function resetCollections() {
  logger.log('\n⚠️  RESET MODE — Dropping seeded collections...');
  await Promise.all([
    SubscriptionPlan.deleteMany({}),
    Permission.deleteMany({}),
    Role.deleteMany({ type: 'system' }),
  ]);
  logger.log('   🗑️  Collections cleared.');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  try {
    logger.log('🌱 HMS Database Seeder');
    logger.log('═'.repeat(40));

    await connectDB();

    const isReset = process.argv.includes('--reset');
    if (isReset) await resetCollections();

    await seedSubscriptionPlans();
    await seedPermissions();
    await seedSystemRoles();

    logger.log('\n' + '═'.repeat(40));
    logger.log('✅ Seeding complete!\n');
    process.exit(0);
  } catch (err) {
    logger.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

main();
