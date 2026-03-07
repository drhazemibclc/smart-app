import type { AppointmentStatus, Doctor, Patient, UserRole } from '@/prisma/types';

// types/index.ts
export interface StaffData {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  role: UserRole;
  department?: string | null;
  licenseNumber?: string | null;
  address?: string | null;
  img?: string | null;
  colorCode?: string | null;
  status?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty: string;
  licenseNumber?: string;
  role?: string;
  img?: string;
  colorCode?: string;
  isActive?: boolean;
  appointmentPrice: number;
  clinicId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup?: string;
  status: string;
  clinicId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteTypes {
  doctor: 'doctor';
  staff: 'staff';
  patient: 'patient';
  payment: 'payment';
  bill: 'bill';
  appointment: 'appointment';
  service: 'service';
  clinic: 'clinic';
}

export type AppointmentsChartProps = {
  name: string;
  appointment: number;
  completed: number;
}[];

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  type: string;
  appointmentDate: Date;
  time: string;
  status: AppointmentStatus;

  patient: Patient;
  doctor: Doctor;
};

export type AvailableDoctorProps = {
  name: string;
  specialty: string;
  img?: string | null;
  colorCode?: string | null;
  workingDays: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}[];
export type Weekday = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
