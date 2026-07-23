const crypto = require('crypto');

class FhirService {
  /**
   * Converts a MongoDB Patient Document to an HL7 FHIR R4 Patient Resource
   * @param {Object} mongoPatient - The patient document from MongoDB
   * @returns {Object} FHIR R4 Patient Resource
   */
  mapPatientToFHIR(mongoPatient) {
    const fhirPatient = {
      resourceType: 'Patient',
      id: mongoPatient._id.toString(),
      meta: {
        versionId: '1',
        lastUpdated: mongoPatient.updatedAt || new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient']
      },
      identifier: [
        {
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR',
                display: 'Medical record number'
              }
            ]
          },
          system: 'https://myhospital.com/uhid',
          value: mongoPatient.uhid
        }
      ],
      name: [
        {
          use: 'official',
          text: `${mongoPatient.firstName} ${mongoPatient.lastName}`,
          family: mongoPatient.lastName,
          given: [mongoPatient.firstName]
        }
      ],
      gender: mongoPatient.gender === 'other' ? 'other' : mongoPatient.gender,
      birthDate: mongoPatient.dateOfBirth ? new Date(mongoPatient.dateOfBirth).toISOString().split('T')[0] : undefined,
      telecom: [
        {
          system: 'phone',
          value: mongoPatient.phone,
          use: 'mobile'
        }
      ]
    };

    // ABHA Identifier
    if (mongoPatient.abha) {
      fhirPatient.identifier.push({
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'PRN',
              display: 'Provider number'
            }
          ]
        },
        system: 'https://ndhm.gov.in',
        value: mongoPatient.abha
      });
    }

    // Email
    if (mongoPatient.email) {
      fhirPatient.telecom.push({
        system: 'email',
        value: mongoPatient.email,
        use: 'home'
      });
    }

    // Address
    if (mongoPatient.address && mongoPatient.address.city) {
      fhirPatient.address = [
        {
          use: 'home',
          line: [mongoPatient.address.street].filter(Boolean),
          city: mongoPatient.address.city,
          state: mongoPatient.address.state,
          postalCode: mongoPatient.address.pincode,
          country: mongoPatient.address.country
        }
      ];
    }

    // Emergency Contact
    if (mongoPatient.emergencyContact && mongoPatient.emergencyContact.name) {
      fhirPatient.contact = [
        {
          relationship: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                  code: 'C',
                  display: mongoPatient.emergencyContact.relationship || 'Emergency Contact'
                }
              ]
            }
          ],
          name: {
            text: mongoPatient.emergencyContact.name
          },
          telecom: [
            {
              system: 'phone',
              value: mongoPatient.emergencyContact.phone
            }
          ]
        }
      ];
    }

    return fhirPatient;
  }

  /**
   * Wraps a list of FHIR resources into a FHIR Document Bundle
   * @param {Array} resources - Array of FHIR resources (Composition, Patient, Encounter, etc.)
   * @returns {Object} FHIR R4 Bundle Resource
   */
  createFHIRBundle(resources) {
    return {
      resourceType: 'Bundle',
      id: crypto.randomUUID(),
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle']
      },
      identifier: {
        system: 'http://hip.in',
        value: crypto.randomUUID()
      },
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: resources.map(res => ({
        fullUrl: `urn:uuid:${res.id}`,
        resource: res
      }))
    };
  }
}

module.exports = new FhirService();
