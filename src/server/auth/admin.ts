import 'dotenv/config';

import { prisma } from '../db';
import { auth } from '.';

// const prisma = new PrismaClient({
//   accelerateUrl: process.env.DATABASE_URL ?? ''
// }).$extends(withAccelerate());

async function seedAdmin(): Promise<void> {
  console.log('🌱 Starting admin user, clinic, and doctor profile seed...');

  const adminEmail = 'hazem0302012@gmail.com';
  const adminPassword = 'HealthF26';
  const adminName = 'Dr. Hazem Ali';
  const adminPhone = '01003497579';
  const clinicName = 'Smart Clinic';

  try {
    // 0️⃣ PRE-SEED CLEANUP
    console.log('🧹 Cleaning up existing admin data...');

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { doctor: true }
    });

    if (existingUser) {
      await prisma.clinicMember.deleteMany({ where: { userId: existingUser.id } });
      if (existingUser.doctor) {
        await prisma.doctor.delete({ where: { id: existingUser.doctor.id } });
      }
      await prisma.account.deleteMany({ where: { userId: existingUser.id } });
      await prisma.session.deleteMany({ where: { userId: existingUser.id } });
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

    // 2️⃣ CREATE USER WITH BETTER AUTH (CORRECT APPROACH)
    console.log('Creating admin user with Better Auth...');

    // Use Better Auth's internal adapter to create user properly
    const user = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName
      }
    });

    if (!user || !user.user) {
      throw new Error('Failed to create user');
    }

    console.log(`✅ User created: ${user.user.email}`);

    // 3️⃣ UPDATE USER TO ADMIN ROLE
    await prisma.user.update({
      where: { id: user.user.id },
      data: {
        isAdmin: true,
        role: 'ADMIN',
        phone: adminPhone,
        emailVerified: true,
        clinicId: clinic.id
      }
    });
    console.log('👑 User upgraded to admin');

    // 4️⃣ CREATE DOCTOR PROFILE
    const adminDoctor = await prisma.doctor.create({
      data: {
        email: adminEmail,
        name: adminName,
        appointmentPrice: 300,
        specialty: 'Pediatrician',
        licenseNumber: 'SMART-ADM-001',
        phone: adminPhone,
        clinicId: clinic.id,
        userId: user.user.id,
        isActive: true,
        role: 'ADMIN'
      }
    });
    console.log(`👨‍⚕️ Doctor Profile created: ${adminDoctor.name}`);

    // 5️⃣ LINK VIA CLINIC MEMBER
    await prisma.clinicMember.create({
      data: {
        userId: user.user.id,
        clinicId: clinic.id,
        role: 'ADMIN'
      }
    });
    console.log('🔗 Admin linked to clinic via ClinicMember.');

    console.log('\n✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🏥 Clinic:', clinicName);
  } catch (err) {
    console.error('❌ Error during seeding:', err instanceof Error ? err.message : err);
    console.error('Full error:', err);
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seedAdmin();
