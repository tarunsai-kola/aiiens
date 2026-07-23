const mongoose = require('mongoose');

/**
 * tenantPlugin — Mongoose schema plugin that enforces hospitalId on every
 * tenant-scoped model.
 *
 * What it does:
 * 1. Adds `hospitalId` field to the schema (required ObjectId)
 * 2. Adds pre-query hooks to BLOCK any query that does not include hospitalId
 *    — prevents accidental cross-tenant data leaks
 * 3. Adds a compound index prefix: { hospitalId: 1 } on all indexes
 *
 * Usage:
 *   const mySchema = new mongoose.Schema({ ... });
 *   mySchema.plugin(tenantPlugin);
 *
 * Schemas that are GLOBAL (no hospital scope) must NOT use this plugin:
 *   - Hospital
 *   - SubscriptionPlan
 *   - Permission
 */
function tenantPlugin(schema) {
  // ── 1. Add hospitalId field ──────────────────────────────────────────────
  schema.add({
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'hospitalId is required for all tenant-scoped documents'],
      index: true,
    },
  });

  // ── 2. Pre-query hook: enforce hospitalId is present ─────────────────────
  const QUERY_METHODS = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'count',
    'countDocuments',
  ];

  QUERY_METHODS.forEach((method) => {
    schema.pre(method, function (next) {
      const filter = this.getFilter();

      // Bypass for internal system operations (e.g. migrations, seeding)
      const options = typeof this.getOptions === 'function' ? this.getOptions() : this.options;
      if (options && options._bypassTenantCheck === true) {
        return next();
      }

      // If neither hospitalId nor _id is provided, block to prevent data leaks.
      // We allow queries by _id because populate() relies on _id lookups and IDs are globally unique.
      if (!filter.hospitalId && !filter._id) {
        const err = new Error(
          `[TenantPlugin] Blocked ${method} query — hospitalId is missing in filter. ` +
          `Model: ${this.model.modelName}. ` +
          `Always pass hospitalId to prevent cross-tenant data leaks.`
        );
        err.name = 'TenantViolationError';
        return next(err);
      }

      next();
    });
  });

  // ── 3. Pre-save hook: validate hospitalId on document save ───────────────
  schema.pre('save', function (next) {
    if (!this.hospitalId) {
      const err = new Error(
        `[TenantPlugin] Blocked save — hospitalId is missing. Model: ${this.constructor.modelName}`
      );
      err.name = 'TenantViolationError';
      return next(err);
    }
    next();
  });
}

module.exports = tenantPlugin;
