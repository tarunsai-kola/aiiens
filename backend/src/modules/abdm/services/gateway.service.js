const axios = require('axios');
const config = require('../config/abdm.config');
const ApiError = require('../../../utils/ApiError');
const crypto = require('crypto');

class GatewayService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${config.gatewayUrl}/sessions`, {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      });

      this.accessToken = response.data.accessToken;
      // Expire 1 minute before actual expiry for safety margin
      this.tokenExpiry = Date.now() + (response.data.expiresIn - 60) * 1000;
      
      return this.accessToken;
    } catch (error) {
      throw ApiError.internal('Failed to authenticate with ABDM Gateway');
    }
  }

  async makeRequest(method, endpoint, payload = null, headers = {}) {
    const token = await this.getAccessToken();
    
    // Generate standard X-CM-ID and REQUEST-ID as per ABDM docs
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const requestHeaders = {
      'Authorization': `Bearer ${token}`,
      'X-CM-ID': 'sbx', // Sandbox CM ID, make dynamic for prod
      'Content-Type': 'application/json',
      ...headers
    };

    const data = payload ? { ...payload, requestId, timestamp } : null;

    try {
      const response = await axios({
        method,
        url: `${config.gatewayUrl}${endpoint}`,
        data,
        headers: requestHeaders,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'ABDM Gateway request failed';
      throw ApiError.internal(msg);
    }
  }
}

module.exports = new GatewayService();
