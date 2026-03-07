import { revalidateTag } from 'next/cache';

export async function invalidateFinancialCascade(clinicId: string, options?: { includePatient?: string }) {
  revalidateTag(`financial-overview-${clinicId}`, 'max');
  revalidateTag(`clinic-stats-${clinicId}`, 'max');
  revalidateTag(`billing_transactions_clinic_date_idx-${clinicId}`, 'max');
  revalidateTag(`payments_clinic_date_idx-${clinicId}`, 'max');
  revalidateTag(`expenses_clinic_date_idx-${clinicId}`, 'max');

  if (options?.includePatient) {
    revalidateTag(`billing_transactions_patient_status_idx-${options.includePatient}`, 'max');
    revalidateTag(`payments_patient_status_idx-${options.includePatient}`, 'max');
  }
}
