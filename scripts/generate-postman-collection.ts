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
}

interface PostmanItem {
  name: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
  response?: PostmanResponse[];
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
    variable?: PostmanVariable[];
  };
}

interface PostmanResponse {
  name: string;
  originalRequest?: PostmanRequest;
  status?: string;
  code?: number;
  body?: string;
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

function generatePostmanCollection() {
  const collection: PostmanCollection = {
    info: {
      name: 'Pediatric Clinic API',
      description: 'Complete API collection for Pediatric Clinic Management System',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: [
      {
        name: 'Patients',
        item: [
          {
            name: 'Create Patient',
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
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '2020-01-15',
                    gender: 'MALE',
                    bloodType: 'O+',
                    allergies: 'Peanuts',
                    parentName: 'Jane Doe',
                    parentPhone: '+1234567890',
                    parentEmail: 'jane@example.com',
                    address: '123 Main St'
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
            response: []
          },
          {
            name: 'Get All Patients',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trpc/patient.getAll?input={{encodeURIComponent(JSON.stringify({"page":1,"pageSize":10}))}}',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'patient.getAll'],
                variable: [
                  {
                    key: 'input',
                    value: '{{encodeURIComponent(JSON.stringify({"page":1,"pageSize":10}))}}'
                  }
                ]
              }
            },
            response: []
          },
          {
            name: 'Get Patient By ID',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trpc/patient.getById?input={{encodeURIComponent(JSON.stringify({"id":"{{patientId}}"}))}}',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'patient.getById'],
                variable: [
                  {
                    key: 'input',
                    value: '{{encodeURIComponent(JSON.stringify({"id":"{{patientId}}"}))}}'
                  }
                ]
              }
            },
            response: []
          },
          {
            name: 'Update Patient',
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
                    id: '{{patientId}}',
                    firstName: 'John Updated',
                    allergies: 'No known allergies'
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
                raw: '{{baseUrl}}/api/trpc/patient.update',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'patient.update']
              }
            },
            response: []
          },
          {
            name: 'Delete Patient',
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
                    id: '{{patientId}}'
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
                raw: '{{baseUrl}}/api/trpc/patient.delete',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'patient.delete']
              }
            },
            response: []
          }
        ]
      },
      {
        name: 'Appointments',
        item: [
          {
            name: 'Create Appointment',
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
                    doctorId: '{{doctorId}}',
                    date: '2024-03-20T10:00:00.000Z',
                    type: 'CHECKUP',
                    reason: 'Annual checkup',
                    duration: 30
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
                raw: '{{baseUrl}}/api/trpc/appointment.create',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'appointment.create']
              }
            },
            response: []
          },
          {
            name: 'Get Appointments by Date Range',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trpc/appointment.getByDateRange?input={{encodeURIComponent(JSON.stringify({"startDate":"2024-03-01T00:00:00.000Z","endDate":"2024-03-31T23:59:59.999Z"}))}}',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'appointment.getByDateRange']
              }
            },
            response: []
          },
          {
            name: 'Update Appointment Status',
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
                    id: '{{appointmentId}}',
                    status: 'CONFIRMED'
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
                raw: '{{baseUrl}}/api/trpc/appointment.updateStatus',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'appointment.updateStatus']
              }
            },
            response: []
          }
        ]
      },
      {
        name: 'Test Scripts',
        item: [
          {
            name: 'Complete Patient Flow',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/api/trpc/patient.getAll',
                host: ['{{baseUrl}}'],
                path: ['api', 'trpc', 'patient.getAll']
              }
            },
            response: []
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
        key: 'appointmentId',
        value: '',
        type: 'string'
      }
    ]
  };

  // Save collection to file
  const collectionPath = path.join(__dirname, '../.postman/collections/pediatric-clinic-api.json');
  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  console.log(`✅ Postman collection generated at ${collectionPath}`);
}

generatePostmanCollection();
