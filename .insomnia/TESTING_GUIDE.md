# Insomnia API Testing Guide

## Quick Start

### 1. Import the Collection

1. Open Insomnia
2. Click on the dropdown next to your workspace name
3. Select "Import/Export" → "Import Data" → "From File"
4. Navigate to `.insomnia/collection.json`
5. Click "Scan" and then "Import"

### 2. Start the Development Server

```bash
npm run dev
```

The server should start on `http://localhost:3000`

### 3. Test Authentication

## Step-by-Step Testing

### Step 1: Health Check

First, verify the server is running:

**Request:** `Health Check`
- Method: GET
- URL: `http://localhost:3000/api/health`
- Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-07T...",
  "environment": "development",
  "database": "available"
}
```

**Note:** The health check doesn't test database connectivity directly due to Bun/Prisma compatibility. Database connectivity is verified through actual API usage.

### Step 2: Login with Admin Credentials

**Request:** `Authentication → Login`
- Method: POST
- URL: `http://localhost:3000/api/auth/sign-in/email`
- Body:
```json
{
  "email": "admin@clinic.local",
  "password": "HealthF26"
}
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "admin@clinic.local",
    "name": "Dr. Hazem Ali",
    "role": "ADMIN",
    "isAdmin": true
  },
  "session": {
    "token": "...",
    "expiresAt": "..."
  }
}
```

**Important:** After successful login, Insomnia will automatically store the session cookie. All subsequent requests will use this cookie for authentication.

### Step 3: Verify Session

**Request:** `Authentication → Get Session`
- Method: GET
- URL: `http://localhost:3000/api/auth/get-session`
- Expected Response: Your current session details

### Step 4: Test Protected Endpoints

Now you can test protected endpoints:

#### List Patients
**Request:** `Patients → List Patients`
- Method: GET
- URL: `http://localhost:3000/api/trpc/patient.list`

#### Create Patient
**Request:** `Patients → Create Patient`
- Method: POST
- URL: `http://localhost:3000/api/trpc/patient.create`
- Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2020-01-15",
  "gender": "MALE",
  "parentName": "Jane Doe",
  "parentPhone": "+1234567890",
  "parentEmail": "jane.doe@example.com"
}
```

#### List Medical Records
**Request:** `Medical Records → List Medical Records`
- Method: GET
- URL: `http://localhost:3000/api/trpc/medical.listRecords?input={"limit":10,"page":1}`

### Step 5: Logout

**Request:** `Authentication → Logout`
- Method: POST
- URL: `http://localhost:3000/api/auth/sign-out`

## Admin Credentials

```
Email: admin@clinic.local
Password: HealthF26
Role: ADMIN
Clinic: Smart Clinic
```

## Environment Variables

The collection includes environment variables that you can customize:

- `baseUrl`: Base URL of your API (default: `http://localhost:3000`)
- `apiUrl`: tRPC API URL (default: `http://localhost:3000/api/trpc`)
- `authToken`: Authentication token (automatically set after login)
- `patientId`: Patient ID for testing (set manually after creating a patient)
- `doctorId`: Doctor ID for testing
- `medicalRecordId`: Medical record ID for testing
- `appointmentId`: Appointment ID for testing
- `visitId`: Visit ID for testing
- `prescriptionId`: Prescription ID for testing

To update environment variables:
1. Click on "Local Development" environment
2. Edit the values
3. Save

## Cookie-Based Authentication

This API uses cookie-based authentication with Better Auth. After logging in:

1. The server sets an HTTP-only cookie with your session token
2. Insomnia automatically stores this cookie
3. All subsequent requests include the cookie automatically
4. You don't need to manually set any Authorization headers

## Troubleshooting

### Issue: "Unauthorized" Error

**Solution:**
1. Make sure you've logged in first using the Login request
2. Check that cookies are enabled in Insomnia (they are by default)
3. Verify the session hasn't expired by calling Get Session
4. If expired, login again

### Issue: "CORS Error"

**Solution:**
- Make sure your `.env` file has the correct `CORS_ORIGIN` setting
- The default should be your ngrok URL or `http://localhost:3000`

### Issue: "Connection Refused"

**Solution:**
- Verify the development server is running: `npm run dev`
- Check the server is listening on port 3000
- Verify `baseUrl` in environment variables matches your server URL

### Issue: "Invalid Credentials"

**Solution:**
- Double-check the email: `admin@clinic.local`
- Double-check the password: `HealthF26`
- Verify the admin user was created: `npm run db:admin`

## Testing Workflow

### Complete Test Flow

1. **Health Check** → Verify server is running
2. **Login** → Authenticate as admin
3. **Get Session** → Verify authentication
4. **Create Patient** → Create a test patient
5. **List Patients** → Verify patient was created
6. **Create Medical Record** → Add medical record for patient
7. **List Medical Records** → Verify record was created
8. **Logout** → End session

### Tips

- Use the Cookie Jar to view stored cookies
- Check the Timeline tab to see request/response details
- Use environment variables to avoid hardcoding IDs
- Save responses to extract IDs for subsequent requests

## Advanced: Using Response Data

After creating a patient, you can extract the patient ID and use it in subsequent requests:

1. Create a patient
2. Copy the `id` from the response
3. Update the `patientId` environment variable
4. Use `{{ _.patientId }}` in other requests

## API Documentation

For complete API documentation, refer to:
- `docs/POSTMAN_TESTING_GUIDE.md` - Detailed API testing guide
- `docs/TRPC_TESTING.md` - tRPC specific testing
- `src/server/api/routers/` - Router implementations

## Support

If you encounter issues:
1. Check the server logs in your terminal
2. Review the Insomnia Timeline for detailed error messages
3. Verify your database is running and migrations are applied
4. Check the `.env` file for correct configuration
