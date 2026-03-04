// types/patient.ts
export interface Patient {
  id: string;
  clinicId: string;
  email?: string;
  phone?: string;
  emergencyContactNumber?: string;
  firstName: string;
  lastName: string;
  userId: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  maritalStatus?: string;
  nutritionalStatus?: string;
  address?: string;
  emergencyContactName?: string;
  relation?: string;
  allergies?: string;
  medicalConditions?: string;
  medicalHistory?: string;
  image?: string;
  colorCode?: string;
  role?: 'PATIENT' | 'ADMIN' | 'DOCTOR' | 'STAFF';
  status?: 'ACTIVE' | 'INACTIVE' | 'DORMANT';
  isActive?: boolean;
  deletedAt?: Date;
  isDeleted?: boolean;
  createdById?: string;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;
  bloodGroup?: string;

  // Relations (optional for forms)
  clinic?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Action response types
export interface PatientActionResponse {
  success: boolean;
  message: string;
  error?: boolean;
  data?: {
    patientId: string;
    userId?: string;
    name?: string;
    email?: string;
  };
}
