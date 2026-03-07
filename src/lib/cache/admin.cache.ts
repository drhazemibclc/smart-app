'use cache';

import { cacheLife, cacheTag } from 'next/cache';

import { adminService } from '@/db/services/admin.service';
import { clinicService } from '@/db/services/clinic.service';
import { doctorService } from '@/db/services/doctor.service';

import { CACHE_PROFILES } from './utils/profiles';
import { CACHE_TAGS } from './utils/tags';

// ==================== DASHBOARD CACHE ====================

/**
 * 🟢 CACHED DASHBOARD STATS
 * Profile: medicalShort - 5 min stale, 10 min revalidate, 30 min expire
 * Tags: Hierarchical clinic dashboard and related entity tags
 */
export async function getCachedDashboardStats(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.admin.dashboard(clinicId));
  cacheTag(CACHE_TAGS.clinic.dashboard(clinicId));
  cacheTag(CACHE_TAGS.clinic.counts(clinicId));
  cacheTag(CACHE_TAGS.patient.byClinic(clinicId));
  cacheTag(CACHE_TAGS.doctor.byClinic(clinicId));
  cacheTag(CACHE_TAGS.appointment.byClinic(clinicId));
  cacheTag(CACHE_TAGS.service.byClinic(clinicId));

  cacheLife(CACHE_PROFILES.medicalShort);

  return adminService.getAdminDashboardStats(clinicId); // ✅ Cache path: no userId, service skips validation
}
/**
 * 🟢 CACHED CLINIC COUNTS
 * Profile: medicalShort - Quick counts for badges
 */
export async function getCachedClinicCounts(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.clinic.counts(clinicId));
  cacheTag(CACHE_TAGS.clinic.dashboard(clinicId));

  cacheLife(CACHE_PROFILES.medicalShort);

  return clinicService.countUserClinics(clinicId); // ✅ Service, not Query
}

// ==================== SERVICE CACHE ====================

/**
 * 🟢 CACHED SERVICES LIST
 * Profile: medicalMedium - 1 hour stale, 2 hour revalidate, 24 hour expire
 */
export async function getCachedServices(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.service.byClinic(clinicId));
  cacheTag(CACHE_TAGS.service.available(clinicId));

  cacheLife(CACHE_PROFILES.medicalMedium);

  return adminService.getServices(clinicId); // ✅ Service, not Query
}

/**
 * 🟢 CACHED SERVICE BY ID
 * Profile: medicalShort - Individual service details
 */
export async function getCachedServiceById(id: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.service.byId(id));
  cacheTag(CACHE_TAGS.service.byClinic(clinicId));

  cacheLife(CACHE_PROFILES.medicalShort);

  return adminService.getServiceById(id, clinicId); // ✅ Service, not Query
}

/**
 * 🟢 CACHED SERVICES WITH USAGE
 * Profile: medicalShort - Includes appointment counts
 */
export async function getCachedServicesWithUsage(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.service.byClinic(clinicId));
  cacheTag(CACHE_TAGS.appointment.byClinic(clinicId));

  cacheLife(CACHE_PROFILES.medicalShort);

  return adminService.getServicesWithUsage(clinicId); // ✅ Service, not Query
}

// ==================== STAFF CACHE ====================

/**
 * 🟢 CACHED STAFF LIST
 * Profile: medicalMedium - Staff directory
 */
export async function getCachedStaffList(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.staff.byClinic(clinicId));

  cacheLife(CACHE_PROFILES.medicalMedium);

  return adminService.getStaffList(clinicId); // ✅ Service, not Query
}

/**
 * 🟢 CACHED STAFF BY ID
 * Profile: medicalShort - Individual staff details
 */
export async function getCachedStaffById(id: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.staff.byId(id));
  cacheTag(CACHE_TAGS.staff.byClinic(clinicId));

  cacheLife(CACHE_PROFILES.medicalShort);

  return adminService.getStaffById(id, clinicId); // ✅ Service, not Query
}

// ==================== DOCTOR CACHE ====================

/**
 * 🟢 CACHED DOCTOR LIST
 * Profile: medicalMedium - Doctor directory with working days
 */
export async function getCachedDoctorList(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.doctor.byClinic(clinicId));
  cacheTag(CACHE_TAGS.workingDays.byClinic(clinicId));

  cacheLife(CACHE_PROFILES.medicalMedium);

  return adminService.getDoctorList(clinicId); // ✅ Service, not Query
}

/**
 * 🟢 CACHED DOCTOR BY ID
 * Profile: medicalShort - Individual doctor with working days
 */
export async function getCachedDoctorById(id: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.doctor.byId(id));
  cacheTag(CACHE_TAGS.doctor.byClinic(clinicId));
  cacheTag(CACHE_TAGS.workingDays.byDoctor(id));

  cacheLife(CACHE_PROFILES.medicalShort);

  return adminService.getDoctorById(id, clinicId); // ✅ Service, not Query
}

// ==================== PATIENT CACHE ====================

/**
 * 🟢 CACHED PATIENT BY ID
 * Profile: medicalShort - Quick patient lookup
 */
export async function getCachedPatientById(id: string, clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.patient.byId(id));
  cacheTag(CACHE_TAGS.patient.byClinic(clinicId));

  cacheLife(CACHE_PROFILES.medicalShort);

  return adminService.getPatientById(id, clinicId); // ✅ Service, not Query
}

// ==================== APPOINTMENT CACHE ====================

/**
 * 🟢 CACHED TODAY'S SCHEDULE
 * Profile: realtime - 10 sec stale, 30 sec revalidate
 */
export async function getCachedTodaySchedule(clinicId: string) {
  'use cache';

  cacheTag(CACHE_TAGS.appointment.today(clinicId));
  cacheTag(CACHE_TAGS.clinic.dashboard(clinicId));

  cacheLife(CACHE_PROFILES.realtime);

  return doctorService.getTodaySchedule(clinicId); // ✅ Service, not Query
}

// ==================== ACTIVITY CACHE ====================

/**
 * 🟢 CACHED RECENT ACTIVITY
 * Profile: medicalMedium - Audit log activity
 */
export async function getCachedRecentActivity(userId: string, clinicId: string, limit = 20) {
  'use cache';

  cacheTag(CACHE_TAGS.admin.activity(userId));
  cacheTag(CACHE_TAGS.admin.activityByClinic(clinicId));
  cacheTag(CACHE_TAGS.clinic.activity(clinicId));

  cacheLife(CACHE_PROFILES.medicalMedium);

  return adminService.getRecentActivity(userId, clinicId, limit); // ✅ Service, not Query
}

export async function getCachedAvailableDoctors(clinicId: string, doctorId: string, day: string) {
  'use cache';

  cacheTag(CACHE_TAGS.doctor.workingDays(doctorId, day));
  cacheTag(CACHE_TAGS.doctor.byClinic(clinicId));
  cacheTag(CACHE_TAGS.appointment.today(clinicId));
  cacheLife(CACHE_PROFILES.realtime); // Availability changes frequently

  return adminService.getAvailableDoctors(clinicId, day);
}
