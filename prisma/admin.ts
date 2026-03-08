// prisma/admin.ts
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '../src/generated/prisma/client';
import { generateId } from '../src/lib/id';
import { logger } from '../src/logger';

const connectionString = process.env.DATABASE_URL ?? '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const log = logger.child({ module: 'seed', action: 'create-admin' });

  log.info('🌱 Starting admin user, clinic, and doctor profile seed...');

  const adminEmail = 'hazem032012@gmail.com';
  const adminPassword = 'HealthF26';
  const adminName = 'Dr. Hazem Ali';
  const adminPhone = '01003497579';
  const clinicName = 'Smart Clinic';

  try {
    // Skip the queryRaw test - just try a simple findFirst to test connection
    log.info('Testing database connection...');
    try {
      const testUser = await prisma.user.findFirst();
      log.info('✅ Database connection successful', { hasUsers: !!testUser });
    } catch (connError) {
      log.error('Database connection failed', connError as Error);
      throw connError;
    }

    // 0️⃣ PRE-SEED CLEANUP - Use a transaction
    log.info('🧹 Cleaning up existing admin data...');

    await prisma.$transaction(async tx => {
      // Find existing user
      const existingUser = await tx.user.findUnique({
        where: { email: adminEmail }
      });

      if (existingUser) {
        log.debug('Found existing user, cleaning up...', { userId: existingUser.id });

        // Delete in correct order to avoid foreign key constraints
        await tx.clinicMember.deleteMany({ where: { userId: existingUser.id } });
        await tx.doctor.deleteMany({ where: { userId: existingUser.id } });
        await tx.session.deleteMany({ where: { userId: existingUser.id } });
        await tx.account.deleteMany({ where: { userId: existingUser.id } });
        await tx.user.delete({ where: { id: existingUser.id } });

        log.info(`🗑️ Removed existing user: ${adminEmail}`);
      }
    });

    // Find and delete existing clinic separately (simpler)
    const existingClinic = await prisma.clinic.findUnique({
      where: { name: clinicName }
    });

    if (existingClinic) {
      await prisma.clinicMember.deleteMany({ where: { clinicId: existingClinic.id } });
      await prisma.clinic.delete({ where: { id: existingClinic.id } });
      log.info('🗑️ Cleared existing clinic');
    }

    // 1️⃣ CREATE CLINIC
    log.debug('Creating clinic...');
    const clinic = await prisma.clinic.create({
      data: {
        name: clinicName,
        address: 'Hurghada, Egypt',
        phone: adminPhone,
        email: adminEmail,
        isDeleted: false,
        // Generate a unique code
        timezone: 'Africa/Cairo'
      }
    });
    log.info(`🏥 Clinic created: ${clinic.name}`, { clinicId: clinic.id });

    // 2️⃣ CREATE USER DIRECTLY
    log.info('Creating admin user directly with Prisma...');

    // Hash password manually
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const userId = generateId('user'); // Make sure generateId works with a prefix

    const user = await prisma.user.create({
      data: {
        id: userId,
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        phone: adminPhone,
        emailVerified: true,
        role: 'ADMIN',
        isAdmin: true
      }
    });

    log.info(`✅ User created via Prisma: ${adminEmail}`, { userId: user.id });

    // 3️⃣ CREATE DOCTOR PROFILE
    log.debug('Creating doctor profile...');
    const adminDoctor = await prisma.doctor.create({
      data: {
        id: generateId('doctor'),
        email: adminEmail,
        name: adminName,
        appointmentPrice: 300,
        specialty: 'Pediatrician',
        licenseNumber: 'SMART-ADM-001',
        phone: adminPhone,
        clinicId: clinic.id,
        userId: user.id,
        isActive: true,
        role: 'ADMIN',
        type: 'FULL',
        availabilityStatus: 'AVAILABLE'
      }
    });
    log.info(`👨‍⚕️ Doctor Profile created: ${adminDoctor.name}`, { doctorId: adminDoctor.id });

    // 4️⃣ CREATE A BASIC ROLE

    // 5️⃣ LINK VIA CLINIC MEMBER
    await prisma.clinicMember.create({
      data: {
        userId: user.id,
        clinicId: clinic.id,
        role: 'ADMIN'
      }
    });
    log.info('🔗 Admin linked to clinic via ClinicMember.');

    // 6️⃣ VERIFY EVERYTHING WAS CREATED
    const verification = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        doctor: true,
        clinicMembers: {
          include: {
            clinic: true,
            user: true
          }
        }
      }
    });

    log.info('\n✅ SEEDING COMPLETED SUCCESSFULLY!', {
      user: {
        id: verification?.id,
        email: verification?.email,
        role: verification?.role,
        isAdmin: verification?.isAdmin
      },
      doctor: verification?.doctor
        ? {
            id: verification.doctor.id,
            specialty: verification.doctor.specialty
          }
        : null,
      clinics: verification?.clinicMembers.map(cm => ({
        id: cm.clinic.id,
        name: cm.clinic.name
      }))
    });

    console.log(`\n${'='.repeat(50)}`);
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🏥 Clinic:', clinicName);
    console.log('👨‍⚕️ Doctor ID:', adminDoctor.id);
    console.log('🆔 User ID:', user.id);
    console.log('='.repeat(50));
  } catch (err) {
    log.error('❌ Error during seeding', err as Error);
    console.error('\n❌ Detailed error:', err);
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the seed function
seedAdmin().catch(e => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
