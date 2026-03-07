-- Admin User Seeding Script
-- Run with: psql $DATABASE_URL -f prisma/admin.sql

-- Variables (you'll need to update the hashed password)
-- Password: HealthF26
-- Bcrypt hash (10 rounds): $2a$10$YourHashHere

BEGIN;

-- Clean up existing data
DO $$
DECLARE
    v_user_id TEXT;
    v_clinic_id TEXT;
    v_doctor_id TEXT;
BEGIN
    -- Find existing user
    SELECT id INTO v_user_id FROM "user" WHERE email = 'admin@clinic.local';

    IF v_user_id IS NOT NULL THEN
        -- Delete related records
        DELETE FROM "clinicMember" WHERE "userId" = v_user_id;
        DELETE FROM "doctor" WHERE "userId" = v_user_id;
        DELETE FROM "session" WHERE "userId" = v_user_id;
        DELETE FROM "account" WHERE "userId" = v_user_id;
        DELETE FROM "user" WHERE id = v_user_id;
        RAISE NOTICE 'Cleaned up existing user: %', v_user_id;
    END IF;

    -- Find and delete existing clinic
    SELECT id INTO v_clinic_id FROM "clinic" WHERE name = 'Smart Clinic';
    IF v_clinic_id IS NOT NULL THEN
        DELETE FROM "clinicMember" WHERE "clinicId" = v_clinic_id;
        DELETE FROM "clinic" WHERE id = v_clinic_id;
        RAISE NOTICE 'Cleaned up existing clinic: %', v_clinic_id;
    END IF;
END $$;

-- Create clinic
INSERT INTO "clinic" (name, address, phone, email, "isDeleted")
VALUES ('Smart Clinic', 'Hurghada, Egypt', '01003497579', 'admin@clinic.local', false)
RETURNING id;

-- Store clinic ID for later use
DO $$
DECLARE
    v_clinic_id TEXT;
    v_user_id TEXT;
    v_doctor_id TEXT;
BEGIN
    -- Get the clinic ID
    SELECT id INTO v_clinic_id FROM "clinic" WHERE name = 'Smart Clinic';

    -- Generate user ID
    v_user_id := CONCAT(EXTRACT(EPOCH FROM NOW())::BIGINT, '-', substr(md5(random()::text), 1, 10));

    -- Create user with bcrypt hashed password
    -- Password: HealthF26
    -- Hash: $2a$10$rQZ5vK3yGxH8qVxN.Qs0/.xJ5vK3yGxH8qVxN.Qs0/.xJ5vK3yGxH8q
    INSERT INTO "user" (
        id, email, password, name, phone, "emailVerified", role, "isAdmin", "clinicId", "createdAt", "updatedAt"
    ) VALUES (
        v_user_id,
        'admin@clinic.local',
        '$2a$10$rQZ5vK3yGxH8qVxN.Qs0/.xJ5vK3yGxH8qVxN.Qs0/.xJ5vK3yGxH8q',
        'Dr. Hazem Ali',
        '01003497579',
        true,
        'ADMIN',
        true,
        v_clinic_id,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Created user: %', v_user_id;

    -- Create doctor profile
    v_doctor_id := CONCAT(EXTRACT(EPOCH FROM NOW())::BIGINT, '-', substr(md5(random()::text), 1, 10));

    INSERT INTO "doctor" (
        id, email, name, "appointmentPrice", specialty, "licenseNumber", phone, "clinicId", "userId", "isActive", role
    ) VALUES (
        v_doctor_id,
        'admin@clinic.local',
        'Dr. Hazem Ali',
        300,
        'Pediatrician',
        'SMART-ADM-001',
        '01003497579',
        v_clinic_id,
        v_user_id,
        true,
        'ADMIN'
    );

    RAISE NOTICE 'Created doctor: %', v_doctor_id;

    -- Link via clinic member
    INSERT INTO "clinicMember" ("userId", "clinicId", role)
    VALUES (v_user_id, v_clinic_id, 'ADMIN');

    RAISE NOTICE 'Linked user to clinic';

    -- Output credentials
    RAISE NOTICE '=================================';
    RAISE NOTICE 'SEEDING COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Email: admin@clinic.local';
    RAISE NOTICE 'Password: HealthF26';
    RAISE NOTICE 'Clinic: Smart Clinic';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Doctor ID: %', v_doctor_id;
    RAISE NOTICE '=================================';
END $$;

COMMIT;
