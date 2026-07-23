const ApiError = require('../utils/ApiError');

/**
 * Validation middleware factory.
 * Validates req.body, req.params, or req.query against a Joi schema.
 *
 * Usage:
 *   router.post('/patients', validate(createPatientSchema), controller.create)
 *
 * @param {Object} schema - Joi schema object
 * @param {'body'|'params'|'query'} target - Which part of the request to validate
 * @returns {Function} Express middleware
 */
const validate = (schema, target = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,  // Return all validation errors, not just the first
      stripUnknown: true, // Remove fields not in schema
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(ApiError.badRequest(message));
    }

    // Replace with sanitized value
    req[target] = value;
    next();
  };
};

module.exports = validate;
