// lib/email/mailhog.service.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export class MailhogService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor() {
    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@localhost.dev';
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILHOG_HOST || 'localhost',
      port: Number.parseInt(process.env.MAILHOG_PORT || '1025', 10),
      secure: false,
      ignoreTLS: true
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent via MailHog:', info.messageId);
      console.log('View at:', `http://localhost:8025/view/${info.messageId}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async getMailhogUI(): Promise<string> {
    return 'http://localhost:8025';
  }
}
