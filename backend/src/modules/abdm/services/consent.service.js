const gatewayService = require('./gateway.service');
const config = require('../config/abdm.config');

class ConsentService {
  async initConsentRequest(patientId, purposeText, hiTypes, dateRange) {
    const payload = {
      consent: {
        purpose: {
          text: purposeText,
          code: 'CAREMGT', // Standard code for care management
        },
        patient: {
          id: patientId // ABHA ID
        },
        hiu: {
          id: config.facilityId
        },
        requester: {
          name: 'Dr. HMS Provider',
          identifier: {
            value: 'HPR_ID', // Healthcare Professional Registry ID
            type: 'REGNO',
            system: 'https://ndhm.gov.in'
          }
        },
        hiTypes: hiTypes || ['Prescription', 'DiagnosticReport', 'DischargeSummary'],
        permission: {
          accessMode: 'VIEW',
          dateRange: dateRange || {
            from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString()
          },
          dataEraseAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          frequency: {
            unit: 'HOUR',
            value: 1,
            repeats: 0
          }
        }
      }
    };

    await gatewayService.makeRequest('POST', '/consent-requests/init', payload);
    return { message: 'Consent request initiated. Awaiting patient approval via PHR app.' };
  }

  async fetchConsentArtifact(consentId) {
    const payload = {
      consentId
    };
    
    // Asks gateway to fetch the artifact. The actual artifact arrives on the webhook /v0.5/consents/on-fetch
    await gatewayService.makeRequest('POST', '/consents/fetch', payload);
    return { message: 'Fetch request sent.' };
  }
}

module.exports = new ConsentService();
