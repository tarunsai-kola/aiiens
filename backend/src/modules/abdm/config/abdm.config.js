require('dotenv').config();

module.exports = {
  gatewayUrl: process.env.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in/gateway/v0.5',
  abhaApiUrl: process.env.ABDM_ABHA_API_URL || 'https://healthidsbx.abdm.gov.in/api/v1',
  clientId: process.env.ABDM_CLIENT_ID || 'dummy_client_id',
  clientSecret: process.env.ABDM_CLIENT_SECRET || 'dummy_client_secret',
  webhookUrl: process.env.ABDM_WEBHOOK_URL || 'https://api.myhospital.com/v1/abdm/callback',
  facilityId: process.env.ABDM_FACILITY_ID || 'HIP_HIU_FACILITY_ID',
};
