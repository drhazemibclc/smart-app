# Insomnia Quick Start

## 🚀 5-Minute Setup

### 1. Import Collection
```bash
# In Insomnia:
# File → Import → From File → Select .insomnia/collection.json
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Login

Open Insomnia and run:

**Authentication → Login**

The credentials are already pre-filled:
```json
{
  "email": "admin@clinic.local",
  "password": "HealthF26"
}
```

Click **Send** ✅

### 4. Verify Session

**Authentication → Get Session**

Click **Send** - You should see your admin user details.

### 5. Test API

Try any endpoint:
- **Patients → List Patients**
- **Medical Records → List Medical Records**
- **Appointments → List Appointments**

## 📋 Admin Credentials

```
Email:    admin@clinic.local
Password: HealthF26
Role:     ADMIN
```

## 🔑 Key Endpoints

| Endpoint             | Method | URL                             |
| -------------------- | ------ | ------------------------------- |
| Login                | POST   | `/api/auth/sign-in/email`       |
| Get Session          | GET    | `/api/auth/get-session`         |
| Logout               | POST   | `/api/auth/sign-out`            |
| List Patients        | GET    | `/api/trpc/patient.list`        |
| Create Patient       | POST   | `/api/trpc/patient.create`      |
| List Medical Records | GET    | `/api/trpc/medical.listRecords` |

## 🍪 Authentication

This API uses **cookie-based authentication**. After login:
- ✅ Cookies are stored automatically
- ✅ All requests are authenticated
- ❌ No need to set Authorization headers

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Create admin user (if needed)
npm run db:admin

# Generate Insomnia collection
npm run generate:insomnia

# Run migrations
npm run db:migrate
```

## 🐛 Troubleshooting

**"Unauthorized" error?**
→ Run the Login request first

**"Connection refused"?**
→ Make sure `npm run dev` is running

**"Invalid credentials"?**
→ Run `npm run db:admin` to create the admin user

## 📚 Full Documentation

See `.insomnia/TESTING_GUIDE.md` for complete testing guide.
