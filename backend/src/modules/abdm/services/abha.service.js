const axios = require('axios');
const config = require('../config/abdm.config');
const gatewayService = require('./gateway.service');
const ApiError = require('../../../utils/ApiError');

class AbhaService {
  // Direct ABHA API calls for creation flow
  async generateAadhaarOtp(aadhaarNumber) {
    try {
      const response = await axios.post(`${config.abhaApiUrl}/registration/aadhaar/generateOtp`, {
        aadhaar: aadhaarNumber
      });
      return response.data; // returns txnId
    } catch (error) {
      throw ApiError.internal('Failed to generate Aadhaar OTP');
    }
  }

  async verifyAadhaarOtp(txnId, otp) {
    try {
      const response = await axios.post(`${config.abhaApiUrl}/registration/aadhaar/verifyOTP`, {
        otp,
        txnId
      });
      return response.data; // returns demographics and auth token
    } catch (error) {
      throw ApiError.internal('Failed to verify Aadhaar OTP');
    }
  }

  async createAbha(txnId, mobile, email) {
    try {
      const response = await axios.post(`${config.abhaApiUrl}/registration/aadhaar/createHealthIdByAdhaar`, {
        txnId,
        mobile,
        email
      });
      return response.data; // returns newly created ABHA profile
    } catch (error) {
      throw ApiError.internal('Failed to create ABHA Number');
    }
  }

  // Gateway calls for Search/Verification
  async searchAbha(healthId) {
    // ABDM Gateway V0.5 flow: async request, response via webhook
    // We send request to /v0.5/users/auth/fetch-modes
    const payload = {
      query: {
        id: healthId,
        purpose: 'KYC_AND_LINK',
        authMode: 'DEMOGRAPHICS'
      }
    };
    
    // Note: This is an async call. The real response comes to our webhook /v0.5/users/auth/on-fetch-modes
    await gatewayService.makeRequest('POST', '/users/auth/fetch-modes', payload);
    return { message: 'Verification request sent. Awaiting webhook callback.' };
  }
}

module.exports = new AbhaService();
