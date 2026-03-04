'use server';

import type Decimal from 'decimal.js';

import { type DatabaseError, databaseError, failure, type Result, success } from '@/lib/result';
import type { Prisma } from '@/prisma/types';

import { prisma } from '../server/db';

// Define the interface to avoid 'any'
export interface UpdatePreferencesData {
  preferredClinicId: string;
}

export interface PatientPreferences {
  appointments: {
    id: string;
    appointmentDate: Date;
    appointmentPrice: Decimal;
    type: string;
    doctor: {
      id: string;
      name: string;
      specialty: string;
      clinic: {
        id: string;
        name: string;
      } | null;
    };
  }[];
  growthRecords: {
    id: string;
    weight: number | null;
    height: number | null;
    bmi: Decimal | null;
    date: Date;
  }[];
  preferredClinic?: {
    id: string;
    name: string;
  } | null;
}

export const getPatientPreferences = async (patientId: string): Promise<Result<PatientPreferences, DatabaseError>> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: patientId },
      select: {
        status: true,
        appointments: {
          select: {
            id: true,
            appointmentDate: true,
            type: true,
            doctor: {
              select: {
                id: true,
                name: true,
                specialty: true,
                clinic: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        growthRecords: {
          select: {
            id: true,
            weight: true,
            height: true,
            bmi: true,
            date: true
          }
        },
        clinic: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!patient) {
      return failure(databaseError('Patient not found'));
    }

    // Standardized to 'ACTIVE' for clinical apps
    if (patient.status !== 'ACTIVE') {
      return failure(databaseError('Patient is not active'));
    }

    return success({
      appointments: patient.appointments as PatientPreferences['appointments'],
      growthRecords: patient.growthRecords,
      preferredClinic: patient.clinic
    });
  } catch (error) {
    console.error('Error while fetching preferences:', error);
    return failure(databaseError('Failed to fetch preferences'));
  }
};

export const updatePatientPreferences = async (
  patientId: string,
  data: UpdatePreferencesData
): Promise<Result<Partial<PatientPreferences>, DatabaseError>> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: patientId },
      select: { status: true }
    });

    if (!patient) {
      return failure(databaseError('Patient not found'));
    }

    if (patient.status !== 'ACTIVE') {
      return failure(databaseError('Only active patients can update preferences'));
    }

    // Verify the clinic exists before connecting
    const clinic = await prisma.clinic.findUnique({
      where: { id: data.preferredClinicId }
    });

    if (!clinic) {
      return failure(databaseError('The selected clinic does not exist'));
    }

    const updatedPatient = await prisma.patient.update({
      where: { userId: patientId },
      data: {
        clinicId: data.preferredClinicId
      },
      select: {
        clinic: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return success({
      preferredClinic: updatedPatient.clinic
    });
  } catch (error) {
    console.error('Error while updating clinic preferences:', error);
    return failure(databaseError('Failed to update clinic preferences'));
  }
};

export async function updateNotificationPreferences(
  userId: string,
  preferences: { pushEnabled?: boolean; emailEnabled?: boolean }
): Promise<Result<{ success: boolean }, DatabaseError>> {
  try {
    const updateData: Prisma.UserUpdateInput = {};

    if (preferences.pushEnabled !== undefined) {
      updateData.pushNotificationsEnabled = preferences.pushEnabled as boolean;
    }

    if (preferences.emailEnabled !== undefined) {
      updateData.emailNotificationsEnabled = preferences.emailEnabled as boolean;
    }

    await prisma.user.update({
      data: updateData,
      where: { id: userId }
    });

    return success({ success: true });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return failure(databaseError('Failed to update notification preferences'));
  }
}

export async function getNotificationPreferences(
  userId: string
): Promise<Result<{ pushEnabled: boolean; emailEnabled: boolean }, DatabaseError>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        pushNotificationsEnabled: true,
        emailNotificationsEnabled: true
      }
    });

    if (!user) {
      return failure(databaseError('User not found'));
    }

    return success({
      pushEnabled: !!user.pushNotificationsEnabled,
      emailEnabled: !!user.emailNotificationsEnabled
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return failure(databaseError('Failed to get notification preferences'));
  }
}
