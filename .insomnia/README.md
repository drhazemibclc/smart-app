# Insomnia Collection

This directory contains the Insomnia collection for API testing.

## Quick Start

### 1. Install Insomnia

```bash
# macOS
brew install --cask insomnia

# Linux
sudo snap install insomnia

# Or download from: https://insomnia.rest/download
```

### 2. Generate Collection

```bash
npm run generate:insomnia
```

### 3. Import to Insomnia

1. Open Insomnia
2. Click **"Create"** → **"Import From"** → **"File"**
3. Select `.insomnia/collection.json`
4. Done!

### 4. Setup Authentication

```bash
# Create test user
npm run db:admin

# Then in Insomnia:
# 1. Open "Authentication" → "Login"
# 2. Update email/password
# 3. Click "Send"
# 4. Cookies are automatically saved!
```

### 5. Start Testing

Click any request and hit "Send". Cookies are automatically included.

## Features

✅ Automatic cookie handling (no manual setup!)
✅ Clean, modern UI
✅ Environment variables with `{{ _.variableName }}`
✅ Response chaining built-in
✅ GraphQL support
✅ Free and open-source

## CLI Testing

```bash
# Install Inso CLI
npm install -g insomnia-inso

# Run tests
npm run test:insomnia
```

## Documentation

- **Full Guide**: `docs/INSOMNIA_GUIDE.md`
- **Insomnia Docs**: https://docs.insomnia.rest/

## Collection Structure

```
Pediatric Clinic API/
├── Authentication/
│   ├── Login
│   ├── Get Session
│   └── Logout
├── Patients/
│   ├── Create Patient
│   ├── List Patients
│   └── Get Patient by ID
├── Medical Records/
│   ├── List Medical Records
│   ├── Create Medical Record
│   ├── Get Medical Record by ID
│   └── Create Vital Signs
├── Appointments/
│   └── List Appointments
└── Health Check
```

## Environment Variables

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

## Tips

### Save Response Values

After creating a patient, save the ID:
1. Right-click response
2. **"Copy Response Body"**
3. Click environment dropdown
4. Edit environment
5. Paste ID into `patientId`

Or use response chaining (see guide).

### View Cookies

Click **"Cookies"** (top right) to view/edit all cookies.

### Keyboard Shortcuts

- `Cmd/Ctrl + Enter` - Send request
- `Cmd/Ctrl + N` - New request
- `Cmd/Ctrl + E` - Switch environment
- `Cmd/Ctrl + K` - Quick switcher

## Troubleshooting

### 401 Unauthorized?
Run the Login request first. Cookies are automatically saved.

### Environment variables not working?
Use `{{ _.variableName }}` (note the underscore!)

### Can't import collection?
Regenerate: `npm run generate:insomnia`

## Why Insomnia?

- ✅ **Simpler** than Postman
- ✅ **Automatic** cookie handling
- ✅ **Free** and open-source
- ✅ **Better** UI/UX
- ✅ **Native** GraphQL support
- ✅ **Built-in** Git sync

## Next Steps

1. ✅ Import collection
2. ✅ Login (Authentication → Login)
3. ✅ Test a few requests
4. ✅ Read full guide: `docs/INSOMNIA_GUIDE.md`
5. ✅ Share with team

---

Happy Testing! 🚀
