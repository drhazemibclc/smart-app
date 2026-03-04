import type { NotificationScenario } from './scenarios';

export type EmailTemplateParams = {
  // User Info
  userName: string;
  userEmail?: string;
  userRole?: 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT' | 'GUARDIAN';

  // Patient Context
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;

  // Clinical Data
  appointmentId?: string;
  appointmentDate?: Date;
  appointmentTime?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;

  // Prescription Data
  prescriptionId?: string;
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  prescribedBy?: string;
  refillCount?: number;

  // Immunization Data
  immunizationId?: string;
  vaccineName?: string;
  vaccineDose?: string;
  nextDueDate?: Date;
  administeredBy?: string;

  // Medical Records
  recordId?: string;
  recordType?: string;
  diagnosis?: string;
  visitDate?: Date;
  followUpDate?: Date;

  // Payment/Billing
  paymentId?: string;
  amount?: number;
  paymentMethod?: string;
  paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED';
  invoiceNumber?: string;
  dueDate?: Date;

  // Action URLs
  actionUrl?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;

  // Additional Info
  notes?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  additionalInfo?: Record<string, string | number | boolean>;
};

export type EmailTemplate = {
  html: string;
  subject: string;
  text?: string; // Plain text version
};

// ========== HELPER FUNCTIONS ==========

const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time: string | undefined): string => {
  if (!time) return '';
  return time;
};

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const getPriorityColor = (priority?: string): string => {
  switch (priority) {
    case 'URGENT':
      return '#dc2626'; // red-600
    case 'HIGH':
      return '#f97316'; // orange-500
    case 'MEDIUM':
      return '#eab308'; // yellow-500
    default:
      return '#22c55e'; // green-500
  }
};

// ========== EMAIL TEMPLATE GENERATOR ==========

export const generateEmailTemplate = (scenario: NotificationScenario, params: EmailTemplateParams): EmailTemplate => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smartclinic.health';
  const logoUrl = `${baseUrl}/icons/ios/256.png`;
  const clinicName = params.clinicName || 'Smart Clinic';
  const clinicPhone = params.clinicPhone || '+1 (800) 123-4567';

  // Build subject with context
  let subject = scenario.email.subject;
  if (params.patientName && params.userRole !== 'PATIENT') {
    subject = `${subject} - ${params.patientName}`;
  }
  if (scenario.type === 'appointment' && params.appointmentDate) {
    subject = `${subject} - ${formatDate(params.appointmentDate)}`;
  }

  // Customize description based on scenario
  let description = scenario.email.description;
  if (scenario.type === 'appointment' && params.appointmentDate) {
    description = `Your appointment has been scheduled for ${formatDate(params.appointmentDate)} at ${params.appointmentTime || 'TBD'}.`;
  }
  if (scenario.type === 'immunization' && params.vaccineName) {
    description = `Your child is due for ${params.vaccineName} (${params.vaccineDose || 'dose'}) on ${formatDate(params.nextDueDate)}.`;
  }
  if (scenario.type === 'prescription' && params.medicationName) {
    description = `Your prescription for ${params.medicationName} is ready. ${params.dosage ? `Dosage: ${params.dosage}` : ''}`;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${subject}</title>
    <style>
        @media only screen and (max-width: 600px) {
            .mobile-text { font-size: 15px !important; }
            .mobile-title { font-size: 22px !important; }
            .mobile-greeting { font-size: 16px !important; }
            .mobile-padding { padding: 24px 20px !important; }
            .mobile-header-padding { padding: 32px 20px !important; }
            .mobile-logo { width: 56px !important; height: 56px !important; }
            .mobile-logo img { width: 56px !important; height: 56px !important; border-radius: 12px !important; }
            .mobile-brand { font-size: 22px !important; }
            .mobile-subtitle { font-size: 14px !important; }
            .mobile-badge { font-size: 13px !important; padding: 8px 16px !important; gap: 8px !important; }
            .mobile-info-box { padding: 20px !important; margin: 24px 0 !important; }
            .mobile-info-label { font-size: 13px !important; }
            .mobile-info-value { font-size: 14px !important; }
            .mobile-cta-padding { padding: 24px 0 !important; }
            .mobile-button { padding: 14px 28px !important; font-size: 15px !important; width: 100% !important; box-sizing: border-box !important; }
            .mobile-footer { padding: 32px 20px !important; }
            .mobile-two-column { grid-template-columns: 1fr !important; }
            .mobile-stack { flex-direction: column !important; gap: 8px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1e293b; background-color: #f8fafc;">

    <!-- Preheader Text -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        ${description.substring(0, 100)}...
    </div>

    <!-- Main Container -->
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); overflow: hidden;">

        <!-- Header with Gradient -->
        <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 40px 32px; text-align: center; color: #ffffff;" class="mobile-header-padding">
            <div style="width: 64px; height: 64px; margin: 0 auto 16px; background-color: rgba(255, 255, 255, 0.15); border-radius: 16px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);" class="mobile-logo">
                <img src="${logoUrl}" alt="${clinicName}" style="width: 64px; height: 64px; border-radius: 16px;" />
            </div>
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; letter-spacing: -0.02em;" class="mobile-brand">${clinicName}</h1>
            <p style="font-size: 15px; opacity: 0.9; font-weight: 400; margin: 0;" class="mobile-subtitle">Pediatric & Family Healthcare</p>
        </div>

        <!-- Content Area -->
        <div style="padding: 32px 32px;" class="mobile-padding">

            <!-- Priority Badge for Urgent Notifications -->
            ${
              params.priority && params.priority !== 'LOW'
                ? `
                <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 100px; font-size: 14px; font-weight: 600; margin-bottom: 24px; background-color: ${getPriorityColor(params.priority)}15; color: ${getPriorityColor(params.priority)}; border: 1px solid ${getPriorityColor(params.priority)}30;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${getPriorityColor(params.priority)};"></span>
                    <span>${params.priority} PRIORITY</span>
                </div>
            `
                : ''
            }

            <!-- Scenario Type Badge -->
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 20px; background-color: #f1f5f9; color: #334155;">
                <span>${scenario.type.replace('-', ' ').toUpperCase()}</span>
            </div>

            <!-- Greeting -->
            <div style="font-size: 18px; font-weight: 500; color: #1e293b; margin-bottom: 8px;" class="mobile-greeting">
                Hello ${params.userName}!
            </div>

            <!-- Title -->
            <div style="font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 16px; line-height: 1.2; letter-spacing: -0.02em;" class="mobile-title">
                ${scenario.email.heading}
            </div>

            <!-- Description -->
            <div style="font-size: 16px; color: #475569; margin-bottom: 32px; line-height: 1.6;" class="mobile-text">
                ${description}
            </div>

            <!-- Patient Context (if applicable) -->
            ${
              params.patientName && params.userRole !== 'PATIENT'
                ? `
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background-color: #0891b2; border-radius: 40px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                            ${params.patientName
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #0f172a;">${params.patientName}</div>
                            <div style="font-size: 13px; color: #64748b;">
                                ${params.patientAge ? `${params.patientAge} years` : ''}
                                ${params.patientGender ? `• ${params.patientGender}` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `
                : ''
            }

            <!-- Dynamic Info Box -->
            ${generateInfoBox(scenario, params)}

            <!-- Doctor/Clinic Info -->
            ${
              params.doctorName
                ? `
                <div style="background-color: #f0f9ff; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #bae6fd;">
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div style="color: #0369a1;">👨‍⚕️</div>
                        <div>
                            <div style="font-weight: 600; color: #0c4a6e;">${params.doctorName}</div>
                            ${params.doctorSpecialty ? `<div style="font-size: 13px; color: #0369a1;">${params.doctorSpecialty}</div>` : ''}
                            ${params.clinicName ? `<div style="font-size: 13px; color: #475569; margin-top: 4px;">${params.clinicName}</div>` : ''}
                            ${params.clinicAddress ? `<div style="font-size: 12px; color: #64748b;">${params.clinicAddress}</div>` : ''}
                        </div>
                    </div>
                </div>
            `
                : ''
            }

            <!-- Notes/Additional Info -->
            ${
              params.notes
                ? `
                <div style="background-color: #fffbeb; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #fed7aa;">
                    <div style="font-weight: 600; color: #92400e; margin-bottom: 8px;">📝 Notes</div>
                    <div style="font-size: 14px; color: #78350f;">${params.notes}</div>
                </div>
            `
                : ''
            }

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 32px 0;" class="mobile-cta-padding">
                ${
                  scenario.email.cta
                    ? `
                    <a href="${baseUrl}${scenario.email.cta.url}${params.appointmentId ? `/${params.appointmentId}` : ''}${params.prescriptionId ? `/${params.prescriptionId}` : ''}"
                       style="display: inline-block; background: #0891b2; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 4px 6px -1px rgba(8, 145, 178, 0.2); transition: all 0.2s;"
                       class="mobile-button">
                        ${scenario.email.cta.text}
                    </a>
                `
                    : ''
                }

                <!-- Secondary Actions -->
                <div style="display: flex; gap: 12px; justify-content: center; margin-top: 16px;" class="mobile-stack">
                    ${
                      params.cancelUrl
                        ? `
                        <a href="${baseUrl}${params.cancelUrl}" style="color: #64748b; text-decoration: none; font-size: 14px; padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px;">Cancel</a>
                    `
                        : ''
                    }
                    ${
                      params.rescheduleUrl
                        ? `
                        <a href="${baseUrl}${params.rescheduleUrl}" style="color: #64748b; text-decoration: none; font-size: 14px; padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px;">Reschedule</a>
                    `
                        : ''
                    }
                </div>
            </div>

            <!-- Divider -->
            <div style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 32px 0;"></div>

            <!-- Help Section -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                <div style="display: flex; gap: 12px;">
                    <div style="color: #0891b2; font-size: 20px;">💬</div>
                    <div>
                        <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Need Assistance?</div>
                        <div style="font-size: 14px; color: #475569; margin-bottom: 12px;">
                            Our support team is here to help you with any questions.
                        </div>
                        <div style="display: flex; gap: 16px;">
                            <a href="tel:${clinicPhone}" style="color: #0891b2; text-decoration: none; font-size: 14px; font-weight: 500;">📞 Call Us</a>
                            <a href="${baseUrl}/contact" style="color: #0891b2; text-decoration: none; font-size: 14px; font-weight: 500;">✉️ Email Support</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;" class="mobile-footer">
            <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">${clinicName}</div>
            <p style="font-size: 13px; color: #475569; margin: 0 0 4px 0; line-height: 1.5;">
                Providing compassionate care for your little ones
            </p>
            ${
              params.clinicAddress
                ? `
                <p style="font-size: 12px; color: #64748b; margin: 4px 0;">${params.clinicAddress}</p>
            `
                : ''
            }
            <p style="font-size: 12px; color: #64748b; margin: 4px 0;">${clinicPhone}</p>

            <!-- Footer Links -->
            <div style="margin: 20px 0;">
                <a href="${baseUrl}/privacy" style="color: #64748b; text-decoration: none; font-size: 12px;">Privacy Policy</a>
                <span style="color: #cbd5e1; margin: 0 8px;">•</span>
                <a href="${baseUrl}/terms" style="color: #64748b; text-decoration: none; font-size: 12px;">Terms of Service</a>
                <span style="color: #cbd5e1; margin: 0 8px;">•</span>
                <a href="${baseUrl}/unsubscribe" style="color: #64748b; text-decoration: none; font-size: 12px;">Unsubscribe</a>
            </div>

            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                This email contains protected health information and is intended only for ${params.userName}.
                If you are not the intended recipient, please contact us immediately.
            </div>

            <div style="margin-top: 16px;">
                <span style="font-size: 10px; color: #94a3b8;">© ${new Date().getFullYear()} ${clinicName}. All rights reserved.</span>
            </div>
        </div>
    </div>
</body>
</html>`;

  // Generate plain text version for email clients that don't support HTML
  const text = generatePlainText(scenario, params, description);

  return {
    html,
    subject,
    text
  };
};

// ========== INFO BOX GENERATOR ==========

const generateInfoBox = (scenario: NotificationScenario, params: EmailTemplateParams): string => {
  const infoItems: { label: string; value: string; icon?: string }[] = [];

  // Appointment Info
  if (scenario.type === 'appointment') {
    if (params.appointmentDate) {
      infoItems.push({
        label: 'Date',
        value: formatDate(params.appointmentDate),
        icon: '📅'
      });
    }
    if (params.appointmentTime) {
      infoItems.push({
        label: 'Time',
        value: params.appointmentTime,
        icon: '⏰'
      });
    }
    if (params.doctorName) {
      infoItems.push({
        label: 'Doctor',
        value: params.doctorName,
        icon: '👨‍⚕️'
      });
    }
  }

  // Prescription Info
  if (scenario.type === 'prescription') {
    if (params.medicationName) {
      infoItems.push({
        label: 'Medication',
        value: params.medicationName,
        icon: '💊'
      });
    }
    if (params.dosage) {
      infoItems.push({
        label: 'Dosage',
        value: params.dosage,
        icon: '⚕️'
      });
    }
    if (params.frequency) {
      infoItems.push({
        label: 'Frequency',
        value: params.frequency,
        icon: '🔄'
      });
    }
    if (params.duration) {
      infoItems.push({
        label: 'Duration',
        value: params.duration,
        icon: '⏱️'
      });
    }
    if (params.refillCount !== undefined) {
      infoItems.push({
        label: 'Refills',
        value: params.refillCount.toString(),
        icon: '🔄'
      });
    }
  }

  // Immunization Info
  if (scenario.type === 'immunization') {
    if (params.vaccineName) {
      infoItems.push({
        label: 'Vaccine',
        value: `${params.vaccineName} ${params.vaccineDose || ''}`,
        icon: '💉'
      });
    }
    if (params.nextDueDate) {
      infoItems.push({
        label: 'Due Date',
        value: formatDate(params.nextDueDate),
        icon: '📆'
      });
    }
    if (params.administeredBy) {
      infoItems.push({
        label: 'Administered By',
        value: params.administeredBy,
        icon: '👩‍⚕️'
      });
    }
  }

  // Medical Record Info
  if (scenario.type === 'medical-record') {
    if (params.recordType) {
      infoItems.push({
        label: 'Record Type',
        value: params.recordType,
        icon: '📋'
      });
    }
    if (params.diagnosis) {
      infoItems.push({
        label: 'Diagnosis',
        value: params.diagnosis,
        icon: '🔬'
      });
    }
    if (params.visitDate) {
      infoItems.push({
        label: 'Visit Date',
        value: formatDate(params.visitDate),
        icon: '📅'
      });
    }
    if (params.followUpDate) {
      infoItems.push({
        label: 'Follow-up',
        value: formatDate(params.followUpDate),
        icon: '🔄'
      });
    }
  }

  // Payment Info
  if (scenario.type === 'payment') {
    if (params.amount) {
      infoItems.push({
        label: 'Amount',
        value: formatCurrency(params.amount),
        icon: '💰'
      });
    }
    if (params.paymentMethod) {
      infoItems.push({
        label: 'Payment Method',
        value: params.paymentMethod,
        icon: '💳'
      });
    }
    if (params.paymentStatus) {
      infoItems.push({
        label: 'Status',
        value: params.paymentStatus,
        icon: '✅'
      });
    }
    if (params.invoiceNumber) {
      infoItems.push({
        label: 'Invoice #',
        value: params.invoiceNumber,
        icon: '🧾'
      });
    }
    if (params.dueDate) {
      infoItems.push({
        label: 'Due Date',
        value: formatDate(params.dueDate),
        icon: '⏰'
      });
    }
  }

  // Common Info
  if (params.appointmentId) {
    infoItems.push({
      label: 'Appointment ID',
      value: `#${params.appointmentId.slice(0, 8).toUpperCase()}`,
      icon: '🆔'
    });
  }
  if (params.prescriptionId) {
    infoItems.push({
      label: 'Prescription ID',
      value: `#${params.prescriptionId.slice(0, 8).toUpperCase()}`,
      icon: '🆔'
    });
  }
  if (params.recordId) {
    infoItems.push({
      label: 'Record ID',
      value: `#${params.recordId.slice(0, 8).toUpperCase()}`,
      icon: '🆔'
    });
  }

  if (infoItems.length === 0) return '';

  return `
		<div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;" class="mobile-two-column">
				${infoItems
          .map(
            item => `
					<div style="display: flex; align-items: center; gap: 12px; padding: 8px; background-color: #f8fafc; border-radius: 12px;">
						<div style="font-size: 24px; width: 32px; text-align: center;">${item.icon || '•'}</div>
						<div>
							<div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">${item.label}</div>
							<div style="font-weight: 600; color: #0f172a; font-size: 14px;">${item.value}</div>
						</div>
					</div>
				`
          )
          .join('')}
			</div>
		</div>
	`;
};

// ========== PLAIN TEXT GENERATOR ==========

const generatePlainText = (
  scenario: NotificationScenario,
  params: EmailTemplateParams,
  description: string
): string => {
  let text = `Hello ${params.userName},\n\n`;
  text += `${scenario.email.heading}\n`;
  text += `${'='.repeat(scenario.email.heading.length)}\n\n`;
  text += `${description}\n\n`;

  // Add key details
  if (params.appointmentDate) {
    text += `Date: ${formatDate(params.appointmentDate)}\n`;
  }
  if (params.appointmentTime) {
    text += `Time: ${params.appointmentTime}\n`;
  }
  if (params.doctorName) {
    text += `Doctor: ${params.doctorName}\n`;
  }
  if (params.medicationName) {
    text += `Medication: ${params.medicationName}\n`;
  }
  if (params.amount) {
    text += `Amount: ${formatCurrency(params.amount)}\n`;
  }

  text += `\nTo view more details, please visit: ${process.env.NEXT_PUBLIC_SITE_URL}${scenario.email.cta?.url || '/dashboard'}\n\n`;

  text += '---\n';
  text += `${params.clinicName || 'Smart Clinic'}\n`;
  text += `Phone: ${params.clinicPhone || '+1 (800) 123-4567'}\n`;
  text += `Website: ${process.env.NEXT_PUBLIC_SITE_URL}\n`;

  return text;
};

// ========== SCENARIO-SPECIFIC TEMPLATES ==========

export const generateAppointmentConfirmationEmail = (params: EmailTemplateParams): EmailTemplate => {
  const scenario = {
    id: 'appointment_scheduled',
    name: 'Appointment Scheduled',
    type: 'appointment' as const,
    category: 'consultation' as const,
    push: { title: '', body: '' },
    inApp: { title: '', body: '' },
    email: {
      subject: `Appointment Confirmation - ${params.clinicName}`,
      heading: 'Your appointment is confirmed',
      description: '',
      cta: { text: 'View Appointment', url: '/dashboard/appointments' }
    }
  };
  return generateEmailTemplate(scenario, params);
};

export const generatePrescriptionReadyEmail = (params: EmailTemplateParams): EmailTemplate => {
  const scenario = {
    id: 'prescription_ready',
    name: 'Prescription Ready',
    type: 'prescription' as const,
    category: 'follow-up' as const,
    push: { title: '', body: '' },
    inApp: { title: '', body: '' },
    email: {
      subject: `Prescription Ready - ${params.patientName || 'Patient'}`,
      heading: 'Your prescription is ready',
      description: '',
      cta: { text: 'View Prescription', url: '/dashboard/prescriptions' }
    }
  };
  return generateEmailTemplate(scenario, params);
};

export const generateImmunizationDueEmail = (params: EmailTemplateParams): EmailTemplate => {
  const scenario = {
    id: 'immunization_due',
    name: 'Immunization Due',
    type: 'immunization' as const,
    category: 'notice' as const,
    push: { title: '', body: '' },
    inApp: { title: '', body: '' },
    email: {
      subject: `Immunization Due - ${params.patientName || 'Child'}`,
      heading: 'Immunization reminder',
      description: '',
      cta: { text: 'Schedule Now', url: '/dashboard/immunizations' }
    }
  };
  return generateEmailTemplate(scenario, params);
};
