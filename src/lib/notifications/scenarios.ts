import type { EmailTemplateParams } from './email-templates';

export type NotificationScenario = {
  id: string;
  name: string;
  type:
    | 'appointment'
    | 'prescription'
    | 'immunization'
    | 'medical-record'
    | 'payment'
    | 'lab-result'
    | 'vital-signs'
    | 'growth-alert'
    | 'follow-up';
  category: 'consultation' | 'follow-up' | 'notice' | 'alert' | 'reminder';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  push: {
    body: string;
    title: string;
  };
  inApp: {
    body: string;
    title: string;
    icon?: string;
    color?: string;
  };
  email: {
    cta?: {
      url: string;
      text: string;
    };
    subject: string;
    heading: string;
    description: string;
  };
  template?: (params: EmailTemplateParams) => string;
};

export const notificationScenarios: NotificationScenario[] = [
  {
    id: 'appointment_scheduled',
    name: 'Appointment Scheduled',
    type: 'appointment',
    category: 'consultation',
    push: {
      title: 'Appointment Scheduled',
      body: 'Your appointment has been scheduled. Check details.'
    },
    inApp: {
      title: 'New Appointment',
      body: 'You have a new appointment scheduled.',
      icon: '📅',
      color: '#0891b2'
    },
    email: {
      subject: 'Appointment Confirmation',
      heading: 'Your appointment is confirmed',
      description: 'Your appointment has been scheduled successfully.',
      cta: { text: 'View Appointment', url: '/dashboard/appointments' }
    }
  },
  {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    type: 'appointment',
    category: 'reminder',
    priority: 'HIGH',
    push: {
      title: 'Appointment Tomorrow',
      body: 'You have an appointment tomorrow at 10:00 AM.'
    },
    inApp: {
      title: 'Upcoming Appointment',
      body: 'Your appointment is tomorrow. Please be on time.',
      icon: '⏰',
      color: '#eab308'
    },
    email: {
      subject: 'Reminder: Upcoming Appointment',
      heading: "Don't forget your appointment",
      description: 'This is a reminder for your appointment tomorrow.',
      cta: { text: 'View Details', url: '/dashboard/appointments' }
    }
  },
  {
    id: 'prescription_ready',
    name: 'Prescription Ready',
    type: 'prescription',
    category: 'notice',
    push: {
      title: 'Prescription Ready',
      body: 'Your prescription is ready to be picked up.'
    },
    inApp: {
      title: 'Prescription Available',
      body: 'Your prescription is now ready.',
      icon: '💊',
      color: '#16a34a'
    },
    email: {
      subject: 'Prescription Ready for Pickup',
      heading: 'Your prescription is ready',
      description: 'Your prescription has been processed and is ready.',
      cta: { text: 'View Prescription', url: '/dashboard/prescriptions' }
    }
  },
  {
    id: 'immunization_due',
    name: 'Immunization Due',
    type: 'immunization',
    category: 'reminder',
    priority: 'HIGH',
    push: {
      title: 'Immunization Due',
      body: "Your child's next immunization is due soon."
    },
    inApp: {
      title: 'Immunization Reminder',
      body: "Schedule your child's immunization.",
      icon: '💉',
      color: '#dc2626'
    },
    email: {
      subject: 'Immunization Due Reminder',
      heading: "Time for your child's immunization",
      description: 'Your child is due for an immunization.',
      cta: { text: 'Schedule Now', url: '/dashboard/immunizations' }
    }
  },
  {
    id: 'medical_record_uploaded',
    name: 'Medical Record Uploaded',
    type: 'medical-record',
    category: 'notice',
    push: {
      title: 'New Medical Record',
      body: 'A new medical record has been added.'
    },
    inApp: {
      title: 'Medical Record Updated',
      body: 'New medical record available.',
      icon: '📋',
      color: '#7c3aed'
    },
    email: {
      subject: 'New Medical Record Available',
      heading: 'Medical record added',
      description: 'A new medical record has been added to your account.',
      cta: { text: 'View Records', url: '/dashboard/medical-records' }
    }
  },
  {
    id: 'payment_received',
    name: 'Payment Received',
    type: 'payment',
    category: 'notice',
    push: {
      title: 'Payment Received',
      body: 'Your payment has been processed successfully.'
    },
    inApp: {
      title: 'Payment Confirmation',
      body: 'Thank you for your payment.',
      icon: '💰',
      color: '#22c55e'
    },
    email: {
      subject: 'Payment Confirmation',
      heading: 'Payment received',
      description: 'Your payment has been successfully processed.',
      cta: { text: 'View Invoice', url: '/dashboard/payments' }
    }
  },
  {
    id: 'lab_results_ready',
    name: 'Lab Results Ready',
    type: 'lab-result',
    category: 'follow-up',
    priority: 'MEDIUM',
    push: {
      title: 'Lab Results Ready',
      body: 'Your lab results are now available.'
    },
    inApp: {
      title: 'Lab Results',
      body: 'Your test results are ready to view.',
      icon: '🔬',
      color: '#6366f1'
    },
    email: {
      subject: 'Your Lab Results Are Ready',
      heading: 'Lab results available',
      description: 'Your laboratory test results are now available.',
      cta: { text: 'View Results', url: '/dashboard/lab-results' }
    }
  },
  {
    id: 'growth_alert',
    name: 'Growth Alert',
    type: 'growth-alert',
    category: 'alert',
    priority: 'URGENT',
    push: {
      title: 'Growth Alert',
      body: 'Significant change detected in growth pattern.'
    },
    inApp: {
      title: 'Growth Pattern Alert',
      body: "Review your child's recent growth measurements.",
      icon: '📈',
      color: '#f97316'
    },
    email: {
      subject: 'Growth Pattern Alert',
      heading: 'Growth monitoring alert',
      description: "We've detected a significant change in growth pattern.",
      cta: { text: 'View Growth Chart', url: '/dashboard/growth-charts' }
    }
  },
  {
    id: 'follow_up_reminder',
    name: 'Follow-up Reminder',
    type: 'follow-up',
    category: 'reminder',
    priority: 'MEDIUM',
    push: {
      title: 'Follow-up Reminder',
      body: 'Time for your scheduled follow-up.'
    },
    inApp: {
      title: 'Follow-up Due',
      body: 'Please schedule your follow-up appointment.',
      icon: '🔄',
      color: '#8b5cf6'
    },
    email: {
      subject: 'Follow-up Reminder',
      heading: 'Time for your follow-up',
      description: 'Your follow-up appointment is due.',
      cta: { text: 'Schedule Now', url: '/dashboard/appointments' }
    }
  }
];

export const getNotificationScenario = (scenarioId: string): NotificationScenario | undefined => {
  return notificationScenarios.find(scenario => scenario.id === scenarioId);
};

export const getScenariosByCategory = (
  category: 'consultation' | 'follow-up' | 'notice' | 'alert' | 'reminder'
): NotificationScenario[] => {
  return notificationScenarios.filter(scenario => scenario.category === category);
};

export const getScenariosByType = (
  type:
    | 'appointment'
    | 'prescription'
    | 'immunization'
    | 'medical-record'
    | 'payment'
    | 'lab-result'
    | 'vital-signs'
    | 'growth-alert'
    | 'follow-up'
): NotificationScenario[] => {
  return notificationScenarios.filter(scenario => scenario.type === type);
};

export const getUrgentScenarios = (): NotificationScenario[] => {
  return notificationScenarios.filter(scenario => scenario.priority === 'URGENT' || scenario.priority === 'HIGH');
};
