const express    = require('express');
const router     = express.Router();

const hospitalController      = require('./hospital.controller');
const validate                = require('../../middlewares/validate.middleware');
const asyncHandler            = require('../../middlewares/asyncHandler');
const { registerHospitalSchema } = require('./hospital.validator');

// POST /api/v1/hospitals/register  (public — no auth)
router.post('/register',
  validate(registerHospitalSchema),
  asyncHandler(hospitalController.register.bind(hospitalController))
);

module.exports = router;
