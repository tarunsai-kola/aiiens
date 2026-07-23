const crypto = require('crypto');
const gatewayService = require('./gateway.service');
const config = require('../config/abdm.config');

class HealthInfoService {
  
  // HIU Flow: Request Data
  async requestHealthInformation(consentId, consentArtifactId) {
    // Generate Diffie-Hellman keys for end-to-end encryption
    const dh = crypto.createECDH('curve25519');
    dh.generateKeys();
    
    // Save private key securely in DB linked to this transaction (omitted for brevity)
    const privateKey = dh.getPrivateKey('base64');
    const publicKey = dh.getPublicKey('base64');
    const nonce = crypto.randomBytes(32).toString('base64');

    const payload = {
      hiRequest: {
        consent: {
          id: consentId
        },
        dateRange: {
          from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        },
        dataPushUrl: `${config.webhookUrl}/health-information/transfer`,
        keyMaterial: {
          cryptoAlg: 'ECDH',
          curve: 'Curve25519',
          dhPublicKey: {
            expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            parameters: 'Curve25519/32byte random key',
            keyValue: publicKey
          },
          nonce: nonce
        }
      }
    };

    await gatewayService.makeRequest('POST', '/health-information/cm/request', payload);
    return { message: 'Health info request sent. Awaiting encrypted data push.' };
  }

  // HIP Flow: Push Data (This is triggered by Webhook /v0.5/health-information/hip/request)
  async pushHealthInformation(transactionId, dataPushUrl, keyMaterial, fhirBundleBase64) {
    // 1. Generate our own keys
    const dh = crypto.createECDH('curve25519');
    dh.generateKeys();
    const myPublicKey = dh.getPublicKey('base64');
    const myNonce = crypto.randomBytes(32).toString('base64');

    // 2. Compute Shared Secret & Encrypt Data (Conceptual, implementation specific to ABDM crypto spec)
    // The actual ABDM spec requires computing HKDF over the shared secret and AES-GCM encryption.
    const encryptedData = `ENCRYPTED_${fhirBundleBase64}`; 

    const payload = {
      pageNumber: 1,
      pageCount: 1,
      transactionId,
      keyMaterial: {
        cryptoAlg: 'ECDH',
        curve: 'Curve25519',
        dhPublicKey: {
          expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          parameters: 'Curve25519/32byte random key',
          keyValue: myPublicKey
        },
        nonce: myNonce
      },
      entries: [
        {
          content: encryptedData,
          media: 'application/fhir+json',
          checksum: 'MD5_CHECKSUM',
          careContextReference: 'OPD_VISIT_01'
        }
      ]
    };

    // Push directly to HIU dataPushUrl, not gateway
    // NOTE: This uses generic axios, not gatewayService because it bypasses gateway
    const axios = require('axios');
    try {
      await axios.post(dataPushUrl, payload, { headers: { 'Content-Type': 'application/json' }});
      
      // Notify Gateway of success
      await gatewayService.makeRequest('POST', '/health-information/notify', {
        notification: {
          consentId: 'CONSENT_ID',
          transactionId,
          doneAt: new Date().toISOString(),
          notifier: { type: 'HIP', id: config.facilityId },
          statusNotification: { sessionStatus: 'TRANSFERRED', hipId: config.facilityId }
        }
      });

    } catch (err) {
      console.error('Failed to push data to HIU', err.message);
    }
  }
}

module.exports = new HealthInfoService();
