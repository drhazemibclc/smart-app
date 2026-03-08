import bcrypt from 'bcryptjs';
import 'dotenv/config';

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
    if (!dbUrl) throw new Error('DATABASE_URL not found');

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed');

    const userId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const doctorId = `${Date.now() + 1}-${Math.random().toString(36).substring(2, 15)}`;
    const clinicId = `${Date.now() + 2}-${Math.random().toString(36).substring(2, 15)}`;

    const sql = `BEGIN;
DO $$
DECLARE v_user_id TEXT; v_clinic_id TEXT;
BEGIN
  SELECT id INTO v_user_id FROM "user" WHERE email = '${adminEmail}';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM users_to_clinics WHERE user_id = v_user_id;
    DELETE FROM doctors WHERE "userId" = v_user_id;
    DELETE FROM session WHERE "userId" = v_user_id;
    DELETE FROM account WHERE "userId" = v_user_id;
    DELETE FROM "user" WHERE id = v_user_id;
  END IF;
  SELECT id INTO v_clinic_id FROM clinics WHERE name = '${clinicName}';
  IF v_clinic_id IS NOT NULL THEN
    DELETE FROM users_to_clinics WHERE clinic_id = v_clinic_id;
    DELETE FROM clinics WHERE id = v_clinic_id;
  END IF;
END $$;
WITH new_clinic AS (
  INSERT INTO clinics (id, name, address, phone, email, "isDeleted", "updatedAt")
  VALUES ('${clinicId}', '${clinicName}', 'Hurghada, Egypt', '${adminPhone}', '${adminEmail}', false, NOW())
  RETURNING id
),
new_user AS (
  INSERT INTO "user" (id, email, password, name, phone, "emailVerified", role, "isAdmin", "clinicId", "createdAt", "updatedAt")
  SELECT '${userId}', '${adminEmail}', '${hashedPassword}', '${adminName}', '${adminPhone}', true, 'ADMIN', true, id, NOW(), NOW()
  FROM new_clinic RETURNING id, "clinicId"
),
new_doctor AS (
  INSERT INTO doctors (id, email, name, appointment_price, specialty, "licenseNumber", phone, clinic_id, "userId", "isActive", role, "updatedAt")
  SELECT '${doctorId}', '${adminEmail}', '${adminName}', 300, 'Pediatrician', 'SMART-ADM-001', '${adminPhone}', "clinicId", id, true, 'ADMIN', NOW()
  FROM new_user RETURNING id
)
INSERT INTO users_to_clinics (user_id, clinic_id, role)
SELECT id, "clinicId", 'ADMIN' FROM new_user;
COMMIT;`;

    const tempFile = path.join(__dirname, 'temp-admin.sql');
    fs.writeFileSync(tempFile, sql);
    console.log('📝 Executing SQL...');
    const { stdout, stderr } = await execAsync(`psql "${dbUrl}" -f "${tempFile}"`);
    fs.unlinkSync(tempFile);

    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('COMMIT')) {
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
