import 'dotenv/config';

import bcrypt from 'bcryptjs';

import { generateId } from '../src/lib/id';
import { logger } from '../src/lib/logger';
import { auth } from '../src/server/auth';
import { prisma } from '../src/server/db';

async function seedAdmin() {
  const log = logger.child({ module: 'seed', action: 'create-admin' });

  log.info('🌱 Starting admin user, clinic, and doctor profile seed...');

  const adminEmail = 'admin@prisma.com';
  const adminPassword = 'HealthF26';
  const adminName = 'Dr. Hazem Ali';
  const adminPhone = '01003497579';
  const clinicName = 'Smart Clinic';

  try {
    // 0️⃣ PRE-SEED CLEANUP
    log.info('🧹 Cleaning up existing admin data...');

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        doctor: true,
        accounts: true,
        sessions: true,
        clinicMembers: true
      }
    });

    if (existingUser) {
      log.debug('Found existing user, cleaning up...', { userId: existingUser.id });

      // Delete in correct order to avoid foreign key constraints
      await prisma.clinicMember.deleteMany({ where: { userId: existingUser.id } });

      if (existingUser.doctor) {
        await prisma.doctor.delete({ where: { id: existingUser.doctor.id } });
      }

      await prisma.session.deleteMany({ where: { userId: existingUser.id } });
      await prisma.account.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });

      log.info(`🗑️ Removed existing user: ${adminEmail}`);
    }

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
        isDeleted: false
      }
    });
    log.info(`🏥 Clinic created: ${clinic.name}`, { clinicId: clinic.id });

    // 2️⃣ CREATE USER WITH BETTER AUTH
    log.info('Creating admin user with Better Auth...');

    let userId: string;

    try {
      // Try Better Auth first
      const signUpResult = await auth.api.createUser({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
          role: 'admin',
          data: {
            role: 'ADMIN',
            clinicId: clinic.id
          }
        }
      });

      if (!signUpResult?.user) {
        throw new Error('Better Auth signup failed');
      }

      userId = signUpResult.user.id;
      log.info(`✅ User created via Better Auth: ${adminEmail}`, { userId });
    } catch (authError) {
      // Fallback to direct Prisma creation if Better Auth fails
      log.warn('Better Auth signup failed, falling back to direct Prisma creation', { error: authError });

      // Hash password manually
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const user = await prisma.user.create({
        data: {
          id: generateId(),
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          phone: adminPhone,
          emailVerified: true,
          role: 'ADMIN',
          isAdmin: true,
          clinicId: clinic.id
        }
      });

      userId = user.id;
      log.info(`✅ User created via Prisma: ${adminEmail}`, { userId });
    }

    // 3️⃣ UPDATE USER TO ADMIN ROLE (if not already set)
    await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: true,
        role: 'ADMIN',
        phone: adminPhone,
        emailVerified: true,
        clinicId: clinic.id
      }
    });
    log.info('👑 User upgraded to admin');

    // 4️⃣ CREATE DOCTOR PROFILE
    log.debug('Creating doctor profile...');
    const adminDoctor = await prisma.doctor.create({
      data: {
        email: adminEmail,
        name: adminName,
        appointmentPrice: 300,
        specialty: 'Pediatrician',
        licenseNumber: 'SMART-ADM-001',
        phone: adminPhone,
        clinicId: clinic.id,
        userId: userId,
        isActive: true,
        role: 'ADMIN'
      }
    });
    log.info(`👨‍⚕️ Doctor Profile created: ${adminDoctor.name}`, { doctorId: adminDoctor.id });

    // 5️⃣ LINK VIA CLINIC MEMBER
    await prisma.clinicMember.create({
      data: {
        userId: userId,
        clinicId: clinic.id,
        role: 'ADMIN'
      }
    });
    log.info('🔗 Admin linked to clinic via ClinicMember.');

    // 6️⃣ VERIFY EVERYTHING WAS CREATED
    const verification = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctor: true,
        clinicMembers: {
          include: {
            clinic: true
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
        name: cm.clinic.name,
        role: cm.role
      }))
    });

    console.log('\n📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🏥 Clinic:', clinicName);
  } catch (err) {
    log.error('❌ Error during seeding', err as Error);
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
