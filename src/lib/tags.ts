import { CACHE_KEYS } from '@/server/redis/cache-keys';

/**
 * Next.js Cache Tags
 * Maps Redis key patterns to Next.js invalidation tags
 */
export const CACHE_TAGS = {
  drug: {
    all: 'drugs',
    active: 'drugs-active',
    categories: 'drug-categories',
    byId: (id: string) => `drug-${id}`,
    byClinic: (clinicId: string) => `drugs-clinic-${clinicId}`,
    interactions: (drugId: string) => `drug-interactions-${drugId}`,
    search: (query: string) => `drug-search-${query}`,
    formulary: (clinicId: string) => `drug-formulary-${clinicId}`
  },
  clinic: {
    prescriptions: (clinicId: string) => `clinic:${clinicId}:prescriptions`,
    byId: (id: string) => CACHE_KEYS.CLINIC(id),
    members: (id: string) => `clinic:${id}:members`,
    settings: (id: string) => `clinic:${id}:settings`,
    features: (id: string) => `clinic:${id}:features`,
    dashboard: (id: string) => CACHE_KEYS.ADMIN_DASHBOARD(id),
    // ADD THESE:
    stats: {
      all: 'clinic:stats:all',
      dashboard: (clinicId: string) => `clinic:stats:dashboard:${clinicId}`,
      prescriptions: (clinicId: string) => `clinic:stats:prescriptions:${clinicId}`
    },
    counts: (clinicId: string) => `clinic:${clinicId}:counts`,
    medicalData: (clinicId: string) => `clinic:${clinicId}:medical-data`
  },
  prescription: {
    byId: (id: string) => CACHE_KEYS.PRESCRIPTION(id),
    byMedicalRecord: (medicalRecordId: string) => CACHE_KEYS.PRESCRIPTIONS_BY_MEDICAL_RECORD(medicalRecordId),
    // ADD THESE:
    byClinic: (clinicId: string) => `prescriptions:clinic:${clinicId}`,
    byPatient: (patientId: string) => `prescriptions:patient:${patientId}`,
    activeByPatient: (patientId: string) => `prescriptions:active:patient:${patientId}`,
    byDoctor: (doctorId: string) => `prescriptions:doctor:${doctorId}`,
    byDate: (date: string) => `prescriptions:date:${date}`,
    byStatus: (status: string) => `prescriptions:status:${status}`,
    recent: (clinicId: string) => `prescriptions:recent:${clinicId}`,
    all: 'prescriptions:all',
    stats: {
      all: 'prescriptions:stats:all',
      byClinic: (clinicId: string) => `prescriptions:stats:clinic:${clinicId}`,
      byDate: (clinicId: string, date: string) => `prescriptions:stats:date:${clinicId}:${date}`,
      byMonth: (clinicId: string, year: number, month: number) =>
        `prescriptions:stats:month:${clinicId}:${year}-${month}`,
      byYear: (clinicId: string, year: number) => `prescriptions:stats:year:${clinicId}:${year}`,
      byStatus: (clinicId: string, status: string) => `prescriptions:stats:status:${clinicId}:${status}`
    }
  },

  user: {
    byId: (id: string) => `user:${id}`,
    clinics: (id: string) => CACHE_KEYS.CLINICS_USER(id)
  },
  patient: {
    byId: (id: string) => CACHE_KEYS.PATIENT(id),
    prescriptions: (patientId: string) => `patient:${patientId}:prescriptions`,
    medicalSummary: (patientId: string) => `patient:${patientId}:medical-summary`,
    growth: (id: string) => CACHE_KEYS.PATIENT_GROWTH(id)
  },
  appointment: {
    today: (clinicId: string) => CACHE_KEYS.APPOINTMENT_TODAY(clinicId),
    byDateRange: (from: string, to: string) => `appointments:range:${from}:${to}`
  },
  medical: {
    record: {
      byClinic: (clinicId: string) => CACHE_KEYS.MEDICAL_RECORDS(clinicId)
    },
    immunization: {
      byClinic: (clinicId: string) => CACHE_KEYS.UPCOMING_IMMUNIZATIONS(clinicId)
    }
  },
  doctor: {
    byClinic: (clinicId: string) => CACHE_KEYS.DOCTORS(clinicId)
  },
  workingDays: {
    byClinic: (clinicId: string) => `clinic:${clinicId}:working-days`
  }
} as const;
