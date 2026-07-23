const hospitalService = require('./hospital.service');
const ApiResponse     = require('../../utils/ApiResponse');

class HospitalController {
  // POST /api/v1/hospitals/register
  async register(req, res) {
    const result = await hospitalService.register(req.body);

    res.status(201).json(ApiResponse.success('Hospital registered successfully', {
      hospital:     { _id: result.hospital._id, name: result.hospital.name, slug: result.hospital.slug },
      user:         result.user,
      accessToken:  result.accessToken,
      refreshToken: result.refreshToken,
    }));
  }
}

module.exports = new HospitalController();
