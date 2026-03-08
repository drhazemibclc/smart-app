# Insomnia Testing Setup Complete ✅

## What's Ready

Your Insomnia collection is now ready to test the admin login and all API endpoints!

## Quick Test (2 minutes)

### 1. Import Collection

In Insomnia:
- File → Import → From File
- Select `.insomnia/collection.json`
- Click Import

### 2. Start Server

```bash
npm run dev
```

### 3. Test Login

In Insomnia:
1. Open **Authentication → Login**
2. The credentials are already filled in:
   - Email: `admin@clinic.local`
   - Password: `HealthF26`
3. Click **Send**
4. ✅ You should see a success response with user details

### 4. Test Session

1. Open **Authentication → Get Session**
2. Click **Send**
3. ✅ You should see your admin user details

### 5. Test Protected Endpoint

1. Open **Patients → List Patients**
2. Click **Send**
3. ✅ You should see a list of patients (may be empty initially)

## Admin Credentials

```
Email:    admin@clinic.local
Password: HealthF26
Role:     ADMIN
Clinic:   Smart Clinic
```

## What Was Updated

1. ✅ **Insomnia Collection** (`.insomnia/collection.json`)
   - Updated login request with correct admin credentials
   - Pre-configured all endpoints
   - Set up environment variables

2. ✅ **Quick Start Guide** (`.insomnia/QUICK_START.md`)
   - 5-minute setup instructions
   - Key endpoints reference
   - Troubleshooting tips

3. ✅ **Testing Guide** (`.insomnia/TESTING_GUIDE.md`)
   - Complete step-by-step testing workflow
   - Authentication details
   - Cookie handling explanation
   - Advanced testing scenarios

4. ✅ **README** (`.insomnia/README.md`)
   - Updated with admin credentials
   - Added documentation links
   - Improved quick start section

## Available Endpoints

### Authentication
- ✅ Login (POST `/api/auth/sign-in/email`)
- ✅ Get Session (GET `/api/auth/get-session`)
- ✅ Logout (POST `/api/auth/sign-out`)

### Patients
- ✅ List Patients (GET `/api/trpc/patient.list`)
- ✅ Create Patient (POST `/api/trpc/patient.create`)

### Medical Records
- ✅ List Medical Records (GET `/api/trpc/medical.listRecords`)
- ✅ Create Medical Record (POST `/api/trpc/medical.createMedicalRecord`)
- ✅ Get Medical Record by ID (GET `/api/trpc/medical.getMedicalRecordById`)
- ✅ Create Vital Signs (POST `/api/trpc/medical.createVitalSigns`)

### Appointments
- ✅ List Appointments (GET `/api/trpc/appointment.list`)

### Health
- ✅ Health Check (GET `/api/health`)

## Cookie-Based Authentication

The API uses cookie-based authentication with Better Auth:

1. **Login** → Server sets HTTP-only cookie
2. **Insomnia** → Automatically stores cookie
3. **All Requests** → Cookie included automatically
4. **No Manual Headers** → Everything is automatic!

## Documentation Files

| File                         | Purpose                     |
| ---------------------------- | --------------------------- |
| `.insomnia/QUICK_START.md`   | 5-minute setup guide        |
| `.insomnia/TESTING_GUIDE.md` | Complete testing workflow   |
| `.insomnia/README.md`        | Collection overview         |
| `docs/INSOMNIA_GUIDE.md`     | Comprehensive documentation |
| `ADMIN_SETUP_COMPLETE.md`    | Admin user setup details    |

## Troubleshooting

### "Unauthorized" Error
→ Run the **Login** request first

### "Connection Refused"
→ Make sure `npm run dev` is running

### "Invalid Credentials"
→ Verify admin user exists: `npm run db:admin`

### Can't Import Collection
→ Regenerate: `npm run generate:insomnia`

## Next Steps

1. ✅ Import the collection into Insomnia
2. ✅ Start the dev server: `npm run dev`
3. ✅ Test the login endpoint
4. ✅ Explore other endpoints
5. ✅ Read the full testing guide for advanced scenarios

## Commands Reference

```bash
# Start development server
npm run dev

# Create/recreate admin user
npm run db:admin

# Generate Insomnia collection
npm run generate:insomnia

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

## Support

If you need help:
1. Check `.insomnia/TESTING_GUIDE.md` for detailed instructions
2. Review server logs in your terminal
3. Check Insomnia Timeline for request/response details
4. Verify `.env` configuration

---

Happy Testing! 🚀
