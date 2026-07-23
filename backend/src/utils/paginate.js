/**
 * Reusable pagination helper for Mongoose queries.
 *
 * Usage in a repository:
 *   const { skip, limit, page } = paginate(req.query);
 *   const data = await Model.find(filter).skip(skip).limit(limit);
 *   const total = await Model.countDocuments(filter);
 *   return buildPaginationMeta(total, page, limit);
 *
 * @param {Object} query - req.query object
 * @param {number} [defaultLimit=10]
 * @returns {{ page: number, limit: number, skip: number }}
 */
const paginate = (query = {}, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds the pagination metadata object for ApiResponse.paginated().
 * @param {number} total - Total document count
 * @param {number} page  - Current page
 * @param {number} limit - Items per page
 * @returns {{ total, page, limit, totalPages, hasNextPage, hasPrevPage }}
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { paginate, buildPaginationMeta };
