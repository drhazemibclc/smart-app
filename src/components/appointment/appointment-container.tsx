import type { Doctor, Patient } from '@/server/db/types';
import { createCaller } from '@/trpc/server';

import { BookAppointment } from '../forms/book-appointment';

export const AppointmentContainer = async ({ id }: { id: string }) => {
  const caller = await createCaller();

  const [patient, doctors] = await Promise.all([caller.patient.getById(id), caller.doctor.getAvailable()]);

  return (
    <div>
      <BookAppointment
        data={(patient as Patient) ?? undefined}
        doctors={(doctors as Doctor[]) ?? []}
      />
    </div>
  );
};
