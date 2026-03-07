# Postman Testing Guide for Pediatric Clinic App

Complete guide for testing your Next.js 16 + tRPC application using Postman.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Collection Structure](#collection-structure)
5. [Running Tests](#running-tests)
6. [CLI Testing with Newman](#cli-testing-with-newman)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Postman Desktop App (v10+) or Postman CLI
- Node.js 18+ installed
- Your app running locally (`npm run dev`)
- Postman API Key (for automation)

## Initial Setup

### 1. Install Postman

Download and install Postman Desktop:
```bash
# macOS (Homebrew)
brew install --cask postman

# Linux (Snap)
sudo snap install postman

# Or download from: https://www.postman.com/downloads/
```

### 2. Install Newman (CLI Runner)

```bash
npm install -g newman newman-reporter-htmlextra
```

### 3. Get Your Postman API Key

1. Open Postman Desktop
2. Go to Settings → API Keys
3. Generate a new API key
4. Copy the key

### 4. Configure Environment Variables

Add to your `.env` file:
```bash
# Postman Configuration
POSTMAN_API_KEY=your_api_key_here
POSTMAN_WORKSPACE_ID=your_workspace_id
```

## Environment Configuration

### Create Postman Environment

1. Open Postman
2. Click "Environments" in the left sidebar
3. Click "+" to create new environment
4. Name it "Local Development"
5. Add these variables:

```json
{
  "baseUrl": "http://localhost:3000",
  "apiUrl": "http://localhost:3000/api/trpc",
  "authToken": "",
  "patientId": "",
  "doctorId": "",
  "medicalRecordId": "",
  "appointmentId": "",
  "visitId": "",
  "prescriptionId": ""
}
```

### Create Additional Environments

**Staging Environment:**
```json
{
  "baseUrl": "https://staging.yourapp.com",
  "apiUrl": "https://staging.yourapp.com/api/trpc",
  "authToken": ""
}
```

**Production Environment:**
```json
{
  "baseUrl": "https://yourapp.com",
  "apiUrl": "https://yourapp.com/api/trpc",
  "authToken": ""
}
```

## Collection Structure

### Generate the Collection

Run the generator script:
```bash
npm run generate:postman
# or
bun run scripts/generate-postman-collection.ts
```

This creates: `.postman/collections/pediatric-clinic-medical.json`

### Import Collection to Postman

1. Open Postman
2. Click "Import" button
3. Select `.postman/collections/pediatric-clinic-medical.json`
4. Click "Import"

### Collection Organization

```
Pediatric Clinic API
├── Authentication
│   ├── Login
│   ├── Register
│   └── Logout
├── Medical Records
│   ├── Create Medical Record
│   ├── List Medical Records
│   ├── Get Single Record
│   ├── Update Record
│   ├── Search Records
│   └── Add Vital Signs
├── Patients
│   ├── Create Patient
│   ├── List Patients
│   ├── Get Patient
│   └── Update Patient
├── Appointments
│   ├── Create Appointment
│   ├── List Appointments
│   └── Update Appointment
└── Test Suites
    └── Complete Medical Record Flow
```

## Running Tests

### Method 1: Postman Desktop UI

1. **Single Request:**
   - Select a request from the collection
   - Click "Send"
   - View response in the bottom panel
   - Check "Test Results" tab for assertions

2. **Folder/Collection:**
   - Right-click on a folder or collection
   - Select "Run folder" or "Run collection"
   - Configure iterations and delay
   - Click "Run"

### Method 2: Newman CLI

#### Run Entire Collection
```bash
newman run .postman/collections/pediatric-clinic-medical.json \
  -e .postman/environments/local.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./test-reports/report.html
```

#### Run Specific Folder
```bash
newman run .postman/collections/pediatric-clinic-medical.json \
  -e .postman/environments/local.json \
  --folder "Medical Records"
```

#### Run with Iterations
```bash
newman run .postman/collections/pediatric-clinic-medical.json \
  -e .postman/environments/local.json \
  -n 5 \
  --delay-request 1000
```

### Method 3: NPM Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test:postman": "newman run .postman/collections/pediatric-clinic-medical.json -e .postman/environments/local.json",
    "test:postman:report": "newman run .postman/collections/pediatric-clinic-medical.json -e .postman/environments/local.json --reporters cli,htmlextra --reporter-htmlextra-export ./test-reports/postman-report.html",
    "test:postman:medical": "newman run .postman/collections/pediatric-clinic-medical.json -e .postman/environments/local.json --folder 'Medical Records'",
    "generate:postman": "bun run scripts/generate-postman-collection.ts"
  }
}
```

Run tests:
```bash
npm run test:postman
npm run test:postman:report
npm run test:postman:medical
```

## Understanding tRPC Endpoints

### tRPC URL Structure

Your app uses tRPC, so endpoints follow this pattern:
```
POST /api/trpc/[router].[procedure]
GET  /api/trpc/[router].[procedure]?input=[encoded-json]
```

### Available Routers

Based on your `src/server/api/routers/index.ts`:

- `admin` - Admin operations
- `appointment` - Appointment management
- `auth` - Authentication
- `clinic` - Clinic settings
- `dashboard` - Dashboard data
- `doctor` - Doctor management
- `growth` - Growth tracking
- `health` - Health checks
- `medical` - Medical records
- `notification` - Notifications
- `patient` - Patient management
- `Payment` - Payment processing
- `prescription` - Prescriptions
- `search` - Search functionality
- `service` - Services
- `staff` - Staff management
- `user` - User management
- `vac` - Vaccinations
- `visit` - Visit management

### Example Requests

#### Query (GET)
```http
GET /api/trpc/patient.list?input={"limit":10,"page":1}
```

In Postman:
- Method: GET
- URL: `{{apiUrl}}/patient.list`
- Params:
  - Key: `input`
  - Value: `{"limit":10,"page":1}`

#### Mutation (POST)
```http
POST /api/trpc/patient.create
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2020-01-15",
  "gender": "MALE"
}
```

In Postman:
- Method: POST
- URL: `{{apiUrl}}/patient.create`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2020-01-15",
  "gender": "MALE"
}
```

## Authentication

### Setup Authentication

1. **Login Request:**
```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

2. **Extract Token:**
Add this test script to your login request:
```javascript
pm.test("Login successful", function() {
    pm.response.to.have.status(200);
    const response = pm.response.json();

    // Save token to environment
    if (response.token) {
        pm.environment.set("authToken", response.token);
    }

    // Or save session cookie
    const cookies = pm.cookies.all();
    console.log("Cookies:", cookies);
});
```

3. **Use Token in Requests:**

Add to Collection Pre-request Script:
```javascript
// Auto-add auth header to all requests
const token = pm.environment.get("authToken");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: `Bearer ${token}`
    });
}
```

Or use Postman's Authorization tab:
- Type: Bearer Token
- Token: `{{authToken}}`

## Writing Tests

### Basic Test Structure

```javascript
// Test response status
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

// Test response time
pm.test("Response time is less than 500ms", function() {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test response body
pm.test("Response has correct structure", function() {
    const response = pm.response.json();
    pm.expect(response).to.have.property("result");
    pm.expect(response.result).to.have.property("data");
});

// Save data for next requests
pm.test("Save patient ID", function() {
    const response = pm.response.json();
    pm.environment.set("patientId", response.result.data.id);
});
```

### Advanced Test Examples

#### Validate Medical Record Creation
```javascript
pm.test("Medical record created with all fields", function() {
    const response = pm.response.json();
    const record = response.result.data;

    pm.expect(record).to.have.property("id");
    pm.expect(record).to.have.property("diagnosis");
    pm.expect(record).to.have.property("vitalSigns");
    pm.expect(record.vitalSigns).to.be.an("array");
    pm.expect(record.vitalSigns.length).to.be.greaterThan(0);

    // Validate vital signs structure
    const vitals = record.vitalSigns[0];
    pm.expect(vitals).to.have.property("temperature");
    pm.expect(vitals).to.have.property("heartRate");
    pm.expect(vitals.temperature).to.be.a("number");
});
```

#### Test Pagination
```javascript
pm.test("Pagination works correctly", function() {
    const response = pm.response.json();
    const data = response.result.data;

    pm.expect(data).to.have.property("records");
    pm.expect(data).to.have.property("totalCount");
    pm.expect(data).to.have.property("currentPage");
    pm.expect(data).to.have.property("totalPages");

    pm.expect(data.records).to.be.an("array");
    pm.expect(data.records.length).to.be.at.most(data.limit || 10);
});
```

#### Test Search Functionality
```javascript
pm.test("Search returns filtered results", function() {
    const response = pm.response.json();
    const records = response.result.data.records;
    const searchTerm = "bronchitis";

    records.forEach(record => {
        const matchesDiagnosis = record.diagnosis?.toLowerCase().includes(searchTerm);
        const matchesSymptoms = record.symptoms?.some(s =>
            s.toLowerCase().includes(searchTerm)
        );
        const matchesNotes = record.notes?.toLowerCase().includes(searchTerm);

        pm.expect(matchesDiagnosis || matchesSymptoms || matchesNotes).to.be.true;
    });
});
```

## Test Data Management

### Pre-request Script for Test Data

Add to Collection Pre-request:
```javascript
// Generate unique test data
const timestamp = Date.now();
pm.variables.set("timestamp", timestamp);
pm.variables.set("testEmail", `test${timestamp}@example.com`);
pm.variables.set("testPhone", `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`);

// Generate test patient data
const testPatient = {
    firstName: `TestPatient${timestamp}`,
    lastName: "Test",
    dateOfBirth: "2020-01-15",
    gender: "MALE",
    parentName: "Test Parent",
    parentPhone: pm.variables.get("testPhone"),
    parentEmail: pm.variables.get("testEmail")
};

pm.variables.set("testPatient", JSON.stringify(testPatient));
```

### Cleanup Script

Add to Collection Tests (runs after each request):
```javascript
// Cleanup test data after test suite
if (pm.info.iteration === pm.info.iterationCount - 1) {
    // Last iteration - cleanup
    const patientId = pm.environment.get("patientId");

    if (patientId) {
        pm.sendRequest({
            url: `${pm.environment.get("apiUrl")}/patient.delete`,
            method: "POST",
            header: {
                "Content-Type": "application/json"
            },
            body: {
                mode: "raw",
                raw: JSON.stringify({ id: patientId })
            }
        }, function(err, response) {
            console.log("Cleanup completed");
        });
    }
}
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/postman-tests.yml`:
```yaml
name: Postman API Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Setup database
        run: |
          npm run db:push
          npm run db:seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

      - name: Start application
        run: npm run dev &
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
          NODE_ENV: test

      - name: Wait for app to be ready
        run: |
          npx wait-on http://localhost:3000/api/health --timeout 60000

      - name: Install Newman
        run: npm install -g newman newman-reporter-htmlextra

      - name: Run Postman tests
        run: |
          newman run .postman/collections/pediatric-clinic-medical.json \
            -e .postman/environments/ci.json \
            --reporters cli,htmlextra,junit \
            --reporter-htmlextra-export ./test-reports/postman-report.html \
            --reporter-junit-export ./test-reports/junit-report.xml

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: postman-test-results
          path: test-reports/

      - name: Publish test results
        if: always()
        uses: EnricoMi/publish-unit-test-result-action@v2
        with:
          files: test-reports/junit-report.xml
```

### GitLab CI

Create `.gitlab-ci.yml`:
```yaml
postman-tests:
  stage: test
  image: node:20
  services:
    - postgres:16
  variables:
    POSTGRES_DB: testdb
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/testdb
  before_script:
    - npm ci
    - npm install -g newman newman-reporter-htmlextra
    - npm run db:push
    - npm run db:seed
  script:
    - npm run dev &
    - npx wait-on http://localhost:3000/api/health --timeout 60000
    - newman run .postman/collections/pediatric-clinic-medical.json
        -e .postman/environments/ci.json
        --reporters cli,htmlextra,junit
        --reporter-htmlextra-export ./test-reports/postman-report.html
        --reporter-junit-export ./test-reports/junit-report.xml
  artifacts:
    when: always
    paths:
      - test-reports/
    reports:
      junit: test-reports/junit-report.xml
```

## Monitoring & Reporting

### Generate HTML Reports

```bash
newman run .postman/collections/pediatric-clinic-medical.json \
  -e .postman/environments/local.json \
  --reporters htmlextra \
  --reporter-htmlextra-export ./test-reports/report-$(date +%Y%m%d-%H%M%S).html \
  --reporter-htmlextra-title "Pediatric Clinic API Tests" \
  --reporter-htmlextra-showOnlyFails
```

### Postman Monitors

1. Open Postman
2. Go to "Monitors" tab
3. Click "Create Monitor"
4. Select your collection
5. Configure schedule (e.g., every hour)
6. Set environment
7. Enable notifications

### Slack Integration

Add to Collection Tests:
```javascript
// Send results to Slack
if (pm.info.iteration === pm.info.iterationCount - 1) {
    const stats = {
        total: pm.info.requestCount,
        failed: pm.info.failedTests,
        passed: pm.info.passedTests
    };

    pm.sendRequest({
        url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: {
            mode: "raw",
            raw: JSON.stringify({
                text: `API Tests Complete: ${stats.passed}/${stats.total} passed`
            })
        }
    });
}
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```javascript
// Add to next.config.ts
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ];
}
```

#### 2. Authentication Issues
- Check if cookies are being sent
- Verify token format
- Check token expiration
- Enable "Automatically follow redirects" in Postman

#### 3. tRPC Input Encoding
For GET requests, encode the input parameter:
```javascript
// Pre-request script
const input = { limit: 10, page: 1 };
pm.request.url.query.add({
    key: 'input',
    value: JSON.stringify(input)
});
```

#### 4. Environment Variables Not Working
- Ensure environment is selected (top-right dropdown)
- Check variable scope (collection vs environment)
- Use `{{variableName}}` syntax

### Debug Mode

Enable verbose logging:
```bash
newman run collection.json -e environment.json --verbose
```

View request/response details:
```bash
newman run collection.json -e environment.json --debug
```

## Best Practices

1. **Use Environment Variables** - Never hardcode URLs or credentials
2. **Write Descriptive Tests** - Clear test names help debugging
3. **Chain Requests** - Use test scripts to pass data between requests
4. **Cleanup Test Data** - Always clean up after tests
5. **Version Control** - Commit collections and environments (without secrets)
6. **Use Pre-request Scripts** - Generate dynamic test data
7. **Monitor Performance** - Track response times
8. **Organize Collections** - Use folders for logical grouping
9. **Document Requests** - Add descriptions to requests
10. **Run Tests Regularly** - Integrate with CI/CD

## Additional Resources

- [Postman Documentation](https://learning.postman.com/docs/)
- [Newman Documentation](https://github.com/postmanlabs/newman)
- [tRPC Documentation](https://trpc.io/docs)
- [Chai Assertion Library](https://www.chaijs.com/api/bdd/)

## Next Steps

1. Generate your collection: `npm run generate:postman`
2. Import to Postman Desktop
3. Configure environments
4. Run your first test
5. Set up CI/CD integration
6. Create monitors for production

---

For questions or issues, check the troubleshooting section or open an issue in the repository.

