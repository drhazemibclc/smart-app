import * as fs from 'node:fs';
import * as path from 'node:path';

interface InsomniaCollection {
  _type: string;
  __export_format: number;
  __export_date: string;
  __export_source: string;
  resources: InsomniaResource[];
}

interface InsomniaResource {
  _id: string;
  _type: string;
  parentId?: string;
  name: string;
  description?: string;
  method?: string;
  url?: string;
  body?: {
    mimeType: string;
    text: string;
  };
  headers?: Array<{
    name: string;
    value: string;
  }>;
  authentication?: {
    type: string;
  };
  parameters?: Array<{
    name: string;
    value: string;
  }>;
  data?: Record<string, string>;
  cookies?: Array<unknown>;
}

function generateInsomniaCollection() {
  const baseId = 'wrk_pediatric_clinic';
  const envId = 'env_local';

  const collection: InsomniaCollection = {
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toISOString(),
    __export_source: 'pediatric-clinic-api',
    resources: [
      // Workspace
      {
        _id: baseId,
        _type: 'workspace',
        name: 'Pediatric Clinic API',
        description: 'Complete API collection for Pediatric Clinic Medical Records Management'
      },
      // Environment
      {
        _id: envId,
        _type: 'environment',
        parentId: baseId,
        name: 'Local Development',
        data: {
          baseUrl: 'http://localhost:3000',
          apiUrl: 'http://localhost:3000/api/trpc',
          authToken: '',
          patientId: '',
          doctorId: '',
          medicalRecordId: '',
          appointmentId: '',
          visitId: '',
          prescriptionId: ''
        }
      },
      // Cookie Jar
      {
        _id: 'jar_cookies',
        _type: 'cookie_jar',
        parentId: baseId,
        name: 'Default Jar',
        cookies: []
      },
      // Authentication Folder
      {
        _id: 'fld_auth',
        _type: 'request_group',
        parentId: baseId,
        name: 'Authentication',
        description: 'Authentication endpoints'
      },
      // Login Request
      {
        _id: 'req_login',
        _type: 'request',
        parentId: 'fld_auth',
        name: 'Login',
        method: 'POST',
        url: '{{ _.baseUrl }}/api/auth/sign-in/email',
        body: {
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              email: 'admin@example.com',
              password: 'password123'
            },
            null,
            2
          )
        },
        headers: [
          {
            name: 'Content-Type',
            value: 'application/json'
          }
        ]
      },
      // Get Session Request
      {
        _id: 'req_session',
        _type: 'request',
        parentId: 'fld_auth',
        name: 'Get Session',
        method: 'GET',
        url: '{{ _.baseUrl }}/api/auth/get-session',
        headers: []
      },
      // Logout Request
      {
        _id: 'req_logout',
        _type: 'request',
        parentId: 'fld_auth',
        name: 'Logout',
        method: 'POST',
        url: '{{ _.baseUrl }}/api/auth/sign-out',
        headers: []
      },
      // Patients Folder
      {
        _id: 'fld_patients',
        _type: 'request_group',
        parentId: baseId,
        name: 'Patients',
        description: 'Patient management endpoints'
      },
      // Create Patient
      {
        _id: 'req_patient_create',
        _type: 'request',
        parentId: 'fld_patients',
        name: 'Create Patient',
        method: 'POST',
        url: '{{ _.apiUrl }}/patient.create',
        body: {
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              firstName: 'John',
              lastName: 'Doe',
              dateOfBirth: '2020-01-15',
              gender: 'MALE',
              parentName: 'Jane Doe',
              parentPhone: '+1234567890',
              parentEmail: 'jane.doe@example.com'
            },
            null,
            2
          )
        },
        headers: [
          {
            name: 'Content-Type',
            value: 'application/json'
          }
        ]
      },
      // List Patients
      {
        _id: 'req_patient_list',
        _type: 'request',
        parentId: 'fld_patients',
        name: 'List Patients',
        method: 'GET',
        url: '{{ _.apiUrl }}/patient.list'
      },
      {
        _id: 'fld_medical',
        _type: 'request_group',
        parentId: baseId,
        name: 'Medical Records',
        description: 'Medical records management'
      },
      // List Medical Records
      {
        _id: 'req_medical_list',
        _type: 'request',
        parentId: 'fld_medical',
        name: 'List Medical Records',
        method: 'GET',
        url: '{{ _.apiUrl }}/medical.listRecords',
        parameters: [
          {
            name: 'input',
            value: '{"limit":10,"page":1}'
          }
        ]
      },
      // Create Medical Record
      {
        _id: 'req_medical_create',
        _type: 'request',
        parentId: 'fld_medical',
        name: 'Create Medical Record',
        method: 'POST',
        url: '{{ _.apiUrl }}/medical.createMedicalRecord',
        body: {
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              patientId: '{{ _.patientId }}',
              chiefComplaint: 'Persistent cough and fever',
              presentIllness: 'Patient presented with cough and fever for 3 days',
              notes: 'Patient showing signs of bronchitis'
            },
            null,
            2
          )
        },
        headers: [
          {
            name: 'Content-Type',
            value: 'application/json'
          }
        ]
      },
      // Get Medical Record by ID
      {
        _id: 'req_medical_get',
        _type: 'request',
        parentId: 'fld_medical',
        name: 'Get Medical Record by ID',
        method: 'GET',
        url: '{{ _.apiUrl }}/medical.getMedicalRecordById',
        parameters: [
          {
            name: 'input',
            value: '{"id":"{{ _.medicalRecordId }}"}'
          }
        ]
      },
      // Create Vital Signs
      {
        _id: 'req_vitals_create',
        _type: 'request',
        parentId: 'fld_medical',
        name: 'Create Vital Signs',
        method: 'POST',
        url: '{{ _.apiUrl }}/medical.createVitalSigns',
        body: {
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              patientId: '{{ _.patientId }}',
              medicalId: '{{ _.medicalRecordId }}',
              temperature: 37.2,
              heartRate: 95,
              bloodPressureSystolic: 115,
              bloodPressureDiastolic: 75,
              oxygenSaturation: 99,
              weight: 18.5,
              height: 110
            },
            null,
            2
          )
        },
        headers: [
          {
            name: 'Content-Type',
            value: 'application/json'
          }
        ]
      },
      // Appointments Folder
      {
        _id: 'fld_appointments',
        _type: 'request_group',
        parentId: baseId,
        name: 'Appointments',
        description: 'Appointment management'
      },
      // List Appointments
      {
        _id: 'req_appointment_list',
        _type: 'request',
        parentId: 'fld_appointments',
        name: 'List Appointments',
        method: 'GET',
        url: '{{ _.apiUrl }}/appointment.list',
        parameters: [
          {
            name: 'input',
            value: '{"limit":10}'
          }
        ]
      },
      // Health Check
      {
        _id: 'req_health',
        _type: 'request',
        parentId: baseId,
        name: 'Health Check',
        method: 'GET',
        url: '{{ _.baseUrl }}/api/health',
        headers: []
      }
    ]
  };

  // Save collection to file
  const collectionPath = path.join(__dirname, '../.insomnia/collection.json');
  const dir = path.dirname(collectionPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  console.log(`✅ Insomnia collection generated at ${collectionPath}`);
}

generateInsomniaCollection();
