import { prisma } from '@/db/client';
import 'dotenv/config'; // Ensure this is at the top for Better Auth Secrets

import { auth } from '.';

// Define roles as per your UserRole enum if applicable,
// otherwise use strings that match your logic

async function seedAdmin() {
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
      // Delete relationships first
      await prisma.clinicMember.deleteMany({ where: { userId: existingUser.id } });
      if (existingUser.doctor) {
        await prisma.doctor.delete({ where: { id: existingUser.doctor.id } });
      }
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
        timezone: 'Africa/Cairo'
      }
    });
    console.log(`🏥 Clinic created: ${clinic.name}`);

    // 2️⃣ CREATE USER VIA AUTH
    console.log('Creating admin user via Better Auth...');

    // Note: Better Auth handles the hashing and database insertion
    const signUpResult = await auth.api.createUser({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'admin'
      }
    });

    const authUser = signUpResult.user;
    console.log(`✅ User created via auth: ${authUser.email}`);

    // 3️⃣ UPDATE USER WITH CUSTOM FIELDS
    // Since Better Auth might not know about 'isAdmin' or 'phone' in the initial signUp
    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        emailVerified: true,
        isAdmin: true,
        role: 'ADMIN',
        phone: adminPhone,
        clinicId: clinic.id // Link to the clinic in the User model
      }
    });

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
        userId: user.id,
        isActive: true,
        role: 'ADMIN'
      }
    });
    console.log(`👨‍⚕️ Doctor Profile created: ${adminDoctor.name}`);

    // 5️⃣ LINK VIA CLINIC MEMBER
    await prisma.clinicMember.create({
      data: {
        userId: user.id,
        clinicId: clinic.id,
        role: 'ADMIN'
      }
    });
    console.log('🔗 Admin linked to clinic via ClinicMember.');

    // 6️⃣ TEST SIGN-IN
    console.log('🧪 Testing sign-in...');
    const signInResult = await auth.api.createUser({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        data: {
          role: 'ADMIN',
          isAdmin: true
        }
      }
    });

    console.log('✅ Sign-in test successful for:', signInResult.user.email);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('👋 Seed script completed.');
    process.exit(0);
  }
}

seedAdmin();
