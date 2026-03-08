import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

import { PrismaClient } from '../src/generated/prisma/client';

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded successfully');

// Initialize Prisma with proper adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Simple ID generator
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

async function seedAdmin() {
  console.log('🌱 Starting admin user, clinic, and doctor profile seed...');

  const adminEmail = 'admin@clinic.local';
  const adminPassword = 'HealthF26';
  const adminName = 'Dr. Hazem Ali';
  const adminPhone = '01003497579';
  const clinicName = 'Smart Clinic';

  try {
    // 0️⃣ PRE-SEED CLEANUP
    console.log('🧹 Cleaning up existing admin data...');

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
      console.log('Found existing user, cleaning up...');

      // Delete in correct order to avoid foreign key constraints
      await prisma.clinicMember.deleteMany({ where: { userId: existingUser.id } });

      if (existingUser.doctor) {
        await prisma.doctor.delete({ where: { id: existingUser.doctor.id } });
      }

      await prisma.session.deleteMany({ where: { userId: existingUser.id } });
      await prisma.account.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });

      console.log(`🗑️ Removed existing user: ${adminEmail}`);
    }

    const existingClinic = await prisma.clinic.findUnique({
      where: { name: clinicName }
    });

    if (existingClinic) {
      await prisma.clinicMember.deleteMany({ where: { clinicId: existingClinic.id } });
      await prisma.clinic.delete({ where: { id: existingClinic.id } });
      console.log('🗑️ Cleared existing clinic');
    }

    // 1️⃣ CREATE CLINIC
    console.log('Creating clinic...');
    const clinic = await prisma.clinic.create({
      data: {
        name: clinicName,
        address: 'Hurghada, Egypt',
        phone: adminPhone,
        email: adminEmail,
        isDeleted: false
      }
    });
    console.log(`🏥 Clinic created: ${clinic.name}`);

    // 2️⃣ CREATE USER
    console.log('Creating admin user...');
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

    console.log(`✅ User created: ${adminEmail}`);

    // 3️⃣ CREATE DOCTOR PROFILE
    console.log('Creating doctor profile...');
    const adminDoctor = await prisma.doctor.create({
      data: {
        email: adminEmail,
        name: adminName,
        appointmentPrice: 300,
        specialty: 'Pediatrician',
        licenseNumber: 'SMART-ADM-001',
        phone: adminPhone,
        clinicId: clinic.id,
        userId: user.id,
        isActive: true,
        role: 'ADMIN'
      }
    });
    console.log(`👨‍⚕️ Doctor Profile created: ${adminDoctor.name}`);

    // 4️⃣ LINK VIA CLINIC MEMBER
    await prisma.clinicMember.create({
      data: {
        userId: user.id,
        clinicId: clinic.id,
        role: 'ADMIN'
      }
    });
    console.log('🔗 Admin linked to clinic via ClinicMember');

    // 5️⃣ VERIFY
    const verification = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        doctor: true,
        clinicMembers: {
          include: {
            clinic: true
          }
        }
      }
    });

    console.log('\n✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('\n📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🏥 Clinic:', clinicName);
    console.log('👤 User ID:', verification?.id);
    console.log('👨‍⚕️ Doctor ID:', verification?.doctor?.id);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  }
}

seedAdmin().catch(e => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
