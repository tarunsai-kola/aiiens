const mongoose = require('mongoose');
const logger = require('../config/logger');

/**
 * Executes a callback within a MongoDB transaction if the connected topology supports it.
 * Standalone MongoDB instances (like a local dev database) do not support transactions.
 * This utility dynamically checks the topology and falls back to non-transactional
 * execution for standalone instances, preventing the "Transaction numbers are only allowed..." error.
 *
 * @param {Function} callback - Async function that takes the `session` object (or null if unsupported).
 * @returns {Promise<any>} The result of the callback.
 */
async function withTransaction(callback) {
  // Check if we have a connection and client
  const client = mongoose.connection.client;
  if (!client) {
    // If not connected yet, we default to no transaction (or we could throw).
    // In practice, operations happen after connection.
    logger.warn('withTransaction: No mongoose client found, executing without session.');
    return callback(null);
  }

  // Get the topology type from the driver
  const topologyType = client.topology?.description?.type || 'Unknown';

  // Transactions require a ReplicaSet or Sharded cluster
  const supportsTransactions = topologyType !== 'Single' && topologyType !== 'Unknown';

  if (!supportsTransactions) {
    // Execute without a transaction (for standalone local dev instances)
    return callback(null);
  }

  // Execute with a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { withTransaction };
