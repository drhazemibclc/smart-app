# Admin User Setup Complete

## Summary

Successfully created an admin user seeding script that works around the Bun/Prisma/pg compatibility issues by using direct SQL execution via psql.

## What Was Fixed

1. **Insomnia Collection Generator**: Added missing `data` and `cookies` properties to the `InsomniaResource` interface in `scripts/generate-insomnia-collection.ts`

2. **Admin Seeding Script**: Created `prisma/admin-final.ts` that:
   - Uses bcrypt to hash passwords
   - Generates SQL directly and executes via psql
   - Works around Bun's Promise implementation incompatibility with the pg library
   - Properly handles database table naming (snake_case vs camelCase)
   - Creates clinic, user, doctor, and links them via users_to_clinics

## Admin Credentials

```
Email: admin@clinic.local
Password: HealthF26
Clinic: Smart Clinic
Role: ADMIN
```

## Usage

To seed the admin user:

```bash
npm run db:admin
```

## Technical Details

### The Problem
- Bun's custom Promise implementation conflicts with the `pg` library used by `@prisma/adapter-pg`
- Error: "The 'string' argument must be of type string or an instance of Buffer or ArrayBuffer. Received an instance of Object"
- This occurs when Prisma tries to execute queries through the pg adapter

### The Solution
- Created a script that generates SQL and executes it via psql CLI
- Bypasses the Prisma client entirely for this specific seeding operation
- Uses proper table names from the actual database schema:
  - `clinics` (not `clinic`)
  - `doctors` (not `doctor`)
  - `users_to_clinics` (not `clinicMember`)
  - Column names use snake_case: `user_id`, `clinic_id`, `appointment_price`, `updated_at`

### Files Created/Modified

1. `scripts/generate-insomnia-collection.ts` - Fixed TypeScript interface
2. `prisma/admin-final.ts` - Working admin seeding script
3. `prisma/admin-simple.ts` - Intermediate attempt (not used)
4. `prisma/admin-native.ts` - Intermediate attempt (not used)
5. `prisma/admin-sql.ts` - Intermediate attempt (not used)
6. `prisma/admin.sql` - SQL template (not used)
7. `package.json` - Updated `db:admin` script to use `tsx ./prisma/admin-final.ts`

## Database Verification

The admin user was successfully created and verified:

```sql
SELECT email, name, role, "isAdmin" FROM "user" WHERE email = 'admin@clinic.local';
```

Result:
- Email: admin@clinic.local
- Name: Dr. Hazem Ali
- Role: ADMIN
- isAdmin: true

## Next Steps

You can now:
1. Start the development server: `npm run dev`
2. Login with the admin credentials
3. Access the admin dashboard
4. Create additional users, doctors, and manage the clinic
