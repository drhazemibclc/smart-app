import * as fs from 'node:fs';
import * as path from 'node:path';

interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
  };
  item: PostmanItem[];
  variable: PostmanVariable[];
  event?: PostmanEvent[];
}

interface PostmanItem {
  name: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
  response?: PostmanResponse[];
  event?: PostmanEvent[];
}

interface PostmanResponse {
  name: string;
  originalRequest?: PostmanRequest;
  status?: string;
  code?: number;
  body?: string;
}

interface PostmanRequest {
  method: string;
  header: PostmanHeader[];
  body?: {
    mode: string;
    raw: string;
    options: {
      raw: {
        language: string;
      };
    };
  };
  url: {
    raw: string;
    host: string[];
    path: string[];
    query?: PostmanQuery[];
  };
}

interface PostmanHeader {
  key: string;
  value: string;
  type: string;
}

interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
}

interface PostmanQuery {
  key: string;
  value: string;
}

interface PostmanEvent {
  listen: string;
  script: {
    id?: string;
    type: string;
    exec: string[];
  };
}

function generatePostmanCollection() {
  const collection: PostmanCollection = {
    info: {
      name: 'Pediatric Clinic API - Medical Records',
      description: 'Complete API collection for Pediatric Clinic Medical Records Management',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    event: [
      {
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: [
            '// Set timestamp for unique data',
            'const timestamp = Date.now();',
            'pm.variables.set("timestamp", timestamp);',
            '',
            '// Generate test data',
            'pm.variables.set("testPatientFirstName", "TestPatient" + timestamp);',
            'pm.variables.set("testPatientLastName", "Test");',
            'pm.variables.set("testDoctorName", "Dr. Test" + timestamp);',
            '',
            '// Set environment variables if not exist',
            'if (!pm.environment.get("patientId")) {',
            '    pm.environment.set("patientId", "");',
            '}',
            'if (!pm.environment.get("doctorId")) {',
            '    pm.environment.set("doctorId", "");',
            '}',
            'if (!pm.environment.get("medicalRecordId")) {',
            '    pm.environment.set("medicalRecordId", "");',
            '}',
            '',
            '// Add auth cookie if available',
            'const authToken = pm.environment.get("authToken");',
            'if (authToken) {',
            '    pm.request.headers.add({',
            '        key: "Cookie",',
            '        value: "better-auth.session_token=" + authToken',
            '    });',
            '}'
          ]
        }
      }
    ],
    item: [
      {
        name: 'Authentication',
        item: [
          {
            name: 'Login',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json',
                  type: 'text'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    email: 'admin@example.com',
                    password: 'password123'
                  },
                  null,
                  2
                ),
                options: {
                  raw: {
                    language: 'json'
                  }
                }
              },
              url: {
                raw: '{{baseUrl}}/api/auth/sign-in/email',
                host: ['{{baseUrl}}'],
                path: ['api', 'auth', 'sign-in', 'email']
              }
            },
            event: [
              {
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: [
                    'pm.test("Login successful", function() {',
                    '    pm.response.to.have.status(200);',
                    '});',
                    '',
                    '// Extract session token from cookies',
                    'const cookies = pm.cookies.all();',
                    'const sessionCookie = cookies.find(c => c.name === "better-auth.session_token");',
                    'if (sessionCookie) {',
                    '    pm.environment.set("authToken", sessionCookie.value);',
                    '    console.log("Auth token saved:", sessionCookie.value);',
                    '} else {',
                    '    console.log("No session cookie found. Available cookies:", cookies);',
                    '}'
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        name: 'Medical Records',
        item: [
          {
            name: 'Setup Test Data',
            item: [
              {
                name: 'Create Test Patient',
                request: {
                  method: 'POST',
                  header: [
                    {
                      key: 'Content-Type',
                      value: 'application/json',
                      type: 'text'
                    }
                  ],
                  body: {
                    mode: 'raw',
                    raw: JSON.stringify(
                      {
                        firstName: '{{testPatientFirstName}}',
                        lastName: '{{testPatientLastName}}',
                        dateOfBirth: '2020-01-15',
                        gender: 'MALE',
                        parentName: 'Test Parent',
                        parentPhone: '+1234567890',
                        parentEmail: 'test{{timestamp}}@example.com'
                      },
                      null,
                      2
                    ),
                    options: {
                      raw: {
                        language: 'json'
                      }
                    }
                  },
                  url: {
                    raw: '{{baseUrl}}/api/trpc/patient.create',
                    host: ['{{baseUrl}}'],
                    path: ['api', 'trpc', 'patient.create']
                  }
                },
                event: [
                  {
                    listen: 'test',
                    script: {
                      type: 'text/javascript',
                      exec: [
                        'pm.test("Patient created successfully", function() {',
                        '    pm.response.to.have.status(200);',
                        '    const response = pm.response.json();',
                        '    pm.expect(response.result.data).to.have.property("id");',
                        '    pm.environment.set("patientId", response.result.data.id);',
                        '});'
                      ]
                    }
                  }
                ]
              }
            ]
          },
          {
            name: 'Create Medical Record',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json',
                  type: 'text'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    patientId: '{{patientId}}',
                    appointmentId: '{{appointmentId}}',
                    chiefComplaint: 'Persistent cough and fever',
                    presentIllness: 'Patient presented with cough and fever for 3 days',
                    notes: 'Patient showing signs of bronchitis'
                  },
                  null,
                  2
                ),
                options: {
                  raw: {
                    language: 'json'
                  }
                }
              },
              url: {
                raw: '{{baseUrl}}/api/trpc/medical.createMedicalRecord',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'medical.createMedicalRecord']
              }
            },
            event: [
              {
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: [
                    'pm.test("Medical record created successfully", function() {',
                    '    pm.response.to.have.status(200);',
                    '    const response = pm.response.json();',
                    '    pm.expect(response.result.data.data).to.have.property("id");',
                    '    pm.environment.set("medicalRecordId", response.result.data.data.id);',
                    '});'
                  ]
                }
              }
            ]
          },
          {
            name: 'List Medical Records',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trpc/medical.listRecords?input={{encodeURIComponent(JSON.stringify({"limit":10,"page":1}))}}',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'medical.listRecords'],
                query: [
                  {
                    key: 'input',
                    value: '{{encodeURIComponent(JSON.stringify({"limit":10,"page":1}))}}'
                  }
                ]
              }
            },
            event: [
              {
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: [
                    'pm.test("List records returns successfully", function() {',
                    '    pm.response.to.have.status(200);',
                    '    const response = pm.response.json();',
                    '    pm.expect(response.result.data).to.have.property("records");',
                    '    pm.expect(response.result.data).to.have.property("totalCount");',
                    '    pm.expect(response.result.data.records).to.be.an("array");',
                    '});',
                    '',
                    'pm.test("Pagination works correctly", function() {',
                    '    const response = pm.response.json();',
                    '    pm.expect(response.result.data.currentPage).to.eql(1);',
                    '    pm.expect(response.result.data.limit).to.eql(10);',
                    '});'
                  ]
                }
              }
            ]
          },
          {
            name: 'Get Single Medical Record',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trpc/medical.getRecordById?input={{encodeURIComponent(JSON.stringify({"id":"{{medicalRecordId}}"}))}}',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'medical.getRecordById'],
                query: [
                  {
                    key: 'input',
                    value: '{{encodeURIComponent(JSON.stringify({"id":"{{medicalRecordId}}"}))}}'
                  }
                ]
              }
            },
            event: [
              {
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: [
                    'pm.test("Get record by ID returns correct data", function() {',
                    '    pm.response.to.have.status(200);',
                    '    const response = pm.response.json();',
                    '    pm.expect(response.result.data.id).to.eql(pm.environment.get("medicalRecordId"));',
                    '    pm.expect(response.result.data).to.have.property("patient");',
                    '    pm.expect(response.result.data).to.have.property("vitalSigns");',
                    '});'
                  ]
                }
              }
            ]
          },
          {
            name: 'Search Medical Records',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trpc/medical.listRecords?input={{encodeURIComponent(JSON.stringify({"search":"bronchitis","limit":10}))}}',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'medical.listRecords'],
                query: [
                  {
                    key: 'input',
                    value: '{{encodeURIComponent(JSON.stringify({"search":"bronchitis","limit":10}))}}'
                  }
                ]
              }
            },
            event: [
              {
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: [
                    'pm.test("Search returns filtered results", function() {',
                    '    pm.response.to.have.status(200);',
                    '    const response = pm.response.json();',
                    '    const records = response.result.data.records;',
                    '    if (records.length > 0) {',
                    '        records.forEach(record => {',
                    '            const matches = record.diagnosis?.toLowerCase().includes("bronchitis") ||',
                    '                          record.symptoms?.some(s => s.toLowerCase().includes("bronchitis"));',
                    '            pm.expect(matches).to.be.true;',
                    '        });',
                    '    }',
                    '});'
                  ]
                }
              }
            ]
          },
          {
            name: 'Filter Records by Date Range',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trpc/medical.listRecords?input={{encodeURIComponent(JSON.stringify({"fromDate":"2024-01-01T00:00:00.000Z","toDate":"2024-12-31T23:59:59.999Z"}))}}',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'medical.listRecords']
              }
            },
            event: [
              {
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: [
                    'pm.test("Date filtering works", function() {',
                    '    pm.response.to.have.status(200);',
                    '    const response = pm.response.json();',
                    '    const records = response.result.data.records;',
                    '    records.forEach(record => {',
                    '        const recordDate = new Date(record.createdAt);',
                    '        pm.expect(recordDate >= new Date("2024-01-01")).to.be.true;',
                    '        pm.expect(recordDate <= new Date("2024-12-31")).to.be.true;',
                    '    });',
                    '});'
                  ]
                }
              }
            ]
          },
          {
            name: 'Update Medical Record',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json',
                  type: 'text'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    id: '{{medicalRecordId}}',
                    diagnosis: 'Acute bronchitis - Resolved',
                    status: 'COMPLETED',
                    notes: 'Patient fully recovered, no follow-up needed'
                  },
                  null,
                  2
                ),
                options: {
                  raw: {
                    language: 'json'
                  }
                }
              },
              url: {
                raw: '{{baseUrl}}/api/trpc/medical.updateRecord',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'medical.updateRecord']
              }
            },
            event: [
              {
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: [
                    'pm.test("Record updated successfully", function() {',
                    '    pm.response.to.have.status(200);',
                    '    const response = pm.response.json();',
                    '    pm.expect(response.result.data.diagnosis).to.include("Resolved");',
                    '    pm.expect(response.result.data.status).to.eql("COMPLETED");',
                    '});'
                  ]
                }
              }
            ]
          },
          {
            name: 'Add Vital Signs',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json',
                  type: 'text'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    recordId: '{{medicalRecordId}}',
                    vitalSigns: {
                      temperature: 37.2,
                      heartRate: 95,
                      bloodPressureSystolic: 115,
                      bloodPressureDiastolic: 75,
                      oxygenSaturation: 99
                    }
                  },
                  null,
                  2
                ),
                options: {
                  raw: {
                    language: 'json'
                  }
                }
              },
              url: {
                raw: '{{baseUrl}}/api/trpc/medical.addVitalSigns',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'medical.addVitalSigns']
              }
            },
            event: [
              {
                listen: 'test',
                script: {
                  type: 'text/javascript',
                  exec: [
                    'pm.test("Vital signs added successfully", function() {',
                    '    pm.response.to.have.status(200);',
                    '    const response = pm.response.json();',
                    '    pm.expect(response.result.data.temperature).to.eql(37.2);',
                    '    pm.expect(response.result.data.heartRate).to.eql(95);',
                    '});'
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        name: 'Test Suites',
        item: [
          {
            name: 'Complete Medical Record Flow',
            item: [
              {
                name: 'Run All Medical Record Tests',
                request: {
                  method: 'GET',
                  header: [],
                  url: {
                    raw: '{{baseUrl}}/api/trpc/medical.listRecords',
                    host: ['{{baseUrl}}'],
                    path: ['api', 'trpc', 'medical.listRecords']
                  }
                },
                event: [
                  {
                    listen: 'test',
                    script: {
                      type: 'text/javascript',
                      exec: [
                        '// This is a collection runner test',
                        'pm.test("Medical Records API is healthy", function() {',
                        '    pm.response.to.have.status(200);',
                        '});'
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:3000',
        type: 'string'
      },
      {
        key: 'patientId',
        value: '',
        type: 'string'
      },
      {
        key: 'doctorId',
        value: '',
        type: 'string'
      },
      {
        key: 'medicalRecordId',
        value: '',
        type: 'string'
      },
      {
        key: 'appointmentId',
        value: '',
        type: 'string'
      }
    ]
  };

  // Save collection to file
  const collectionPath = path.join(__dirname, '../.postman/collections/pediatric-clinic-medical.json');
  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  console.log(`✅ Postman collection generated at ${collectionPath}`);
}

generatePostmanCollection();
