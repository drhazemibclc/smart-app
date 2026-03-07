import type { Appointment } from '../server/db/types';

// modules/admin/admin.utils.ts
export function calculateAppointmentCounts(appointmentsByStatus: Appointment[]) {
  const counts = {
    PENDING: 0,
    SCHEDULED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    NO_SHOW: 0
  };

  appointmentsByStatus.forEach(({ status, _count }) => {
    if (status && status in counts && typeof _count === 'number') {
      counts[status as keyof typeof counts] = _count;
    }
  });

  return counts;
}

export function processMonthlyData(monthlyAppointments: Appointment[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const result = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    const appointmentsInMonth = monthlyAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();
    });

    result.push({
      name: `${monthName} ${year}`,
      completed: appointmentsInMonth.filter(a => a.status === 'COMPLETED').length,
      pending: appointmentsInMonth.filter(a => a.status === 'PENDING').length,
      scheduled: appointmentsInMonth.filter(a => a.status === 'SCHEDULED').length
    });
  }

  return result;
}
