// src/modules/appointment/appointment.cache.ts
'use cache';

import { cacheLife, cacheTag } from 'next/cache';

import { appointmentService } from '@/db/services/appointment.service';
import type { AppointmentStatus, AppointmentType } from '@/db/types';

import { CACHE_PROFILES } from './utils/profiles';
import { CACHE_TAGS } from './utils/tags';

/**
 * 🟢 CACHE LAYER
 * - ONLY 'use cache' directives
 * - NO Prisma imports
 * - NO business logic
 * - Calls service layer
 */

export async function getCachedTodaysAppointments(clinicId: string, doctorId?: string) {
  'use cache';

  cacheTag(CACHE_TAGS.appointment.today(clinicId));
  if (doctorId) cacheTag(CACHE_TAGS.appointment.byDoctor(doctorId));
  cacheLife(CACHE_PROFILES.realtime);

  return appointmentService.getTodayAppointments(clinicId);
}

export async function getCachedDoctorSchedule(doctorId: string, date: Date, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.doctor.schedule(doctorId));
  cacheTag(CACHE_TAGS.appointment.byDoctor(doctorId));
  cacheTag(CACHE_TAGS.appointment.byClinic(clinicId));
  cacheLife(CACHE_PROFILES.realtime);

  return appointmentService.getDoctorSchedule(doctorId, date);
}

export async function getCachedAppointments(
  clinicId: string,
  filter: {
    startDate?: Date;
    endDate?: Date;
    patientId?: string;
    doctorId?: string;
    status?: AppointmentStatus[];
    type?: AppointmentType[];
    page: number;
    limit: number;
  }
) {
  'use cache';

  cacheTag(CACHE_TAGS.appointment.byClinic(clinicId));
  cacheTag(CACHE_TAGS.appointment.byDate(filter.startDate?.toISOString() || ''));
  cacheLife(CACHE_PROFILES.medicalShort);

  return appointmentService.getAppointments(clinicId, {
    ...filter,
    clinic: clinicId,
    updatedAt: new Date(),
    id: undefined
  });
}

export async function getCachedAvailableSlots(clinicId: string, doctorId: string, date: Date, _duration: number) {
  'use cache';

  cacheTag(`slots:clinic:${clinicId}:doctor:${doctorId}:date:${date.toISOString()}`);
  cacheLife(CACHE_PROFILES.realtime);

  // Service method expects (doctorId, date)
  return appointmentService.getAvailableTimes(doctorId, date);
}

// ==================== TODAY'S APPOINTMENTS ====================
export async function getCachedTodayAppointments(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.appointment.today(clinicId));
  cacheTag(CACHE_TAGS.clinic.dashboard(clinicId));
  cacheLife(CACHE_PROFILES.realtime); // 10s stale, 30s revalidate

  return appointmentService.getTodayAppointments(clinicId);
}

// ==================== MONTH CALENDAR ====================
export async function getCachedMonthAppointments(clinicId: string, year: number, month: number) {
  'use cache';

  const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
  cacheTag(CACHE_TAGS.appointment.byDateRange(clinicId, monthKey));
  cacheLife(CACHE_PROFILES.medicalMedium); // 1h stale, 2h revalidate

  return appointmentService.getMonthAppointments(clinicId, year, month);
}

// ==================== APPOINTMENT DETAIL ====================
export async function getCachedAppointmentById(id: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.appointment.byId(id));
  cacheTag(CACHE_TAGS.appointment.byClinic(clinicId));
  cacheLife(CACHE_PROFILES.medicalShort); // 5m stale, 10m revalidate

  return appointmentService.getAppointmentById(id);
}

// ==================== PATIENT APPOINTMENTS ====================
export async function getCachedPatientAppointments(
  patientId: string,
  clinicId: string,
  options?: { limit?: number; includePast?: boolean }
) {
  'use cache';

  cacheTag(CACHE_TAGS.appointment.byPatient(patientId));
  cacheTag(CACHE_TAGS.patient.appointments(patientId));
  cacheTag(CACHE_TAGS.clinic.activity(clinicId));
  cacheLife(CACHE_PROFILES.medicalShort);

  return appointmentService.getPatientAppointments(patientId, clinicId, options);
}

// ==================== DOCTOR APPOINTMENTS ====================
export async function getCachedDoctorAppointments(doctorId: string, clinicId: string, date: Date) {
  'use cache';

  cacheTag(CACHE_TAGS.appointment.byDoctor(doctorId));
  cacheTag(CACHE_TAGS.appointment.byClinic(clinicId));
  cacheLife(CACHE_PROFILES.realtime);

  return appointmentService.getDoctorAppointments(doctorId, date, clinicId);
}

// ==================== APPOINTMENT STATS ====================
export async function getCachedAppointmentStats(clinicId: string, fromDate?: Date, toDate?: Date) {
  'use cache';

  const dateRange =
    fromDate && toDate ? `${fromDate.toISOString().slice(0, 10)}-${toDate.toISOString().slice(0, 10)}` : 'overall';

  cacheTag(CACHE_TAGS.admin.dashboard(clinicId));
  cacheTag(CACHE_TAGS.appointment.byClinic(clinicId));
  cacheTag(`appointment-stats-${clinicId}-${dateRange}`);
  cacheLife(CACHE_PROFILES.medicalShort);

  return appointmentService.getAppointmentStats(clinicId, fromDate, toDate);
}

// ==================== AVAILABLE TIMES ====================
export async function getCachedAvailableTimes(doctorId: string, _clinicId: string, date: Date) {
  'use cache';

  const dateStr = date.toISOString().split('T')[0];
  cacheTag(CACHE_TAGS.appointment.byDoctor(doctorId));
  cacheTag(`available-times-${doctorId}-${dateStr}`);
  cacheLife(CACHE_PROFILES.realtime); // Real-time availability

  return appointmentService.getAvailableTimes(doctorId, date);
}
