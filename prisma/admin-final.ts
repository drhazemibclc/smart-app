import 'dotenv/config';

import bcrypt from 'bcryptjs';
import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function seedAdmin() {
  console.log('🌱 Starting admin user seed...');

  const adminEmail = 'admin@clinic.local';
  const adminPassword = 'HealthF26';
  const adminName = 'Dr. Hazem Ali';
  const adminPhone = '01003497579';
  const clinicName = 'Smart Clinic';

  try {
    const dbUrl = process.env.DATABASE_URL?.replace('?sslmode=no-verify', '') || '';

    if (!dbUrl) {
      throw new Error('DATABASE_URL not found');
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed');

    const userId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const doctorId = `${Date.now() + 1}-${Math.random().toString(36).substring(2, 15)}`;

    const sql = `BEGIN;

DO $$
DECLARE
    v_user_id TEXT;
    v_clinic_id TEXT;
BEGIN
    SELECT id INTO v_user_id FROM "user" WHERE email = '${adminEmail}';
    IF v_user_id IS NOT NULL THEN
        DELETE FROM "clinicMember" WHERE "userId" = v_user_id;
        DELETE FROM "doctor" WHERE "userId" = v_user_id;
        DELETE FROM "session" WHERE "userId" = v_user_id;
        DELETE FROM "account" WHERE "userId" = v_user_id;
        DELETE FROM "user" WHERE id = v_user_id;
    END IF;

    SELECT id INTO v_clinic_id FROM "clinic" WHERE name = '${clinicName}';
    IF v_clinic_id IS NOT NULL THEN
        DELETE FROM "clinicMember" WHERE "clinicId" = v_clinic_id;
        DELETE FROM "clinic" WHERE id = v_clinic_id;
    END IF;
END $$;

WITH new_clinic AS (
    INSERT INTO "clinic" (name, address, phone, email, "isDeleted")
    VALUES ('${clinicName}', 'Hurghada, Egypt', '${adminPhone}', '${adminEmail}', false)
    RETURNING id
),
new_user AS (
    INSERT INTO "user" (id, email, password, name, phone, "emailVerified", role, "isAdmin", "clinicId", "createdAt", "updatedAt")
    SELECT '${userId}', '${adminEmail}', '${hashedPassword}', '${adminName}', '${adminPhone}', true, 'ADMIN', true, id, NOW(), NOW()
    FROM new_clinic
    RETURNING id, "clinicId"
),
new_doctor AS (
    INSERT INTO "doctor" (id, email, name, "appointmentPrice", specialty, "licenseNumber", phone, "clinicId", "userId", "isActive", role)
    SELECT '${doctorId}', '${adminEmail}', '${adminName}', 300, 'Pediatrician', 'SMART-ADM-001', '${adminPhone}', "clinicId", id, true, 'ADMIN'
    FROM new_user
    RETURNING id
)
INSERT INTO "clinicMember" ("userId", "clinicId", role)
SELECT id, "clinicId", 'ADMIN' FROM new_user;

COMMIT;`;

    // Write SQL to temp file
    const tempFile = path.join(__dirname, 'temp-admin.sql');
    fs.writeFileSync(tempFile, sql);

    console.log('📝 Executing SQL...');
    const { stdout, stderr } = await execAsync(`psql "${dbUrl}" -f "${tempFile}"`);

    // Clean up temp file
    fs.unlinkSync(tempFile);

    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('⚠️  Warnings:', stderr);
    }

    console.log('\n✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('\n📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🏥 Clinic:', clinicName);
    console.log('👤 User ID:', userId);
    console.log('👨‍⚕️ Doctor ID:', doctorId);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seedAdmin();
