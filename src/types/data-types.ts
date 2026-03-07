import type { AppointmentStatus, Doctor, MedicalRecords, Patient, UserRole } from '@/prisma/types';

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
export interface DashboardStats {
  appointmentCounts: {
    scheduled: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
  availableDoctors: number;
  dailyAppointmentsData: Array<{
    appointmentDate: Date;
    appointments: number;
    revenue: number;
  }>;
  last5Records: string[];
  monthlyData: Array<{
    name: string;
    appointment: number;
    completed: number;
  }>;
  services: number;
  todayAppointments: Array<{
    id: string;
    time: Date;
    patient: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
    doctor: {
      id: string;
      name: string | null;
    } | null;
    status: string;
  }>;
  todayAppointmentsCount: number;
  topDoctors: Array<{
    id: string;
    name: string;
    img: string | null;
    specialty: string | null;
    rating: number;
    appointments: number;
  }>;
  topSpecialties: Array<{
    specialty: string;
    count: number;
  }>;
  totalAppointments: number;
  totalDoctors: number;
  totalPatients: number;
  totalRevenue: number;
}

export interface GeneralStats {
  completedAppointments: number;
  completionRate: number;
  totalAppointments: number;
  totalDoctors: number;
  totalPatients: number;
}

export interface MedicalRecordsSummary {
  currentMonthCount: number;
  growth: number;
  previousMonthCount: number;
  recentRecords: MedicalRecords[];
  totalRecords: number;
}

export interface MonthlyPerformance {
  month: string;
  revenue: number;
  visits: number;
}

export interface PersonalizedGreeting {
  childName: string | null;
  message: string;
}

export interface AvailableDoctor {
  id: string;
  name: string;
  specialty: string;
  img: string | null;
  colorCode: string | null;
  workingDays: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  appointmentCount: number;
}

export interface AdminDashboardClientProps {
  clinicId: string;
}
