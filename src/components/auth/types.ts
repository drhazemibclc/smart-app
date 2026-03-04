import type { ReactNode } from 'react';

/**
 * Registration role types for UI selection
 * These match the database enum values (uppercase)
 * Better-Auth normalizes these to lowercase in sessions
 */
export enum RegistrationRole {
  ADMIN = 'ADMIN',
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  STAFF = 'STAFF'
}

export interface RoleFeature {
  icon: ReactNode;
  text: string;
}

export interface RoleOption {
  id: RegistrationRole;
  title: string;
  description: string;
  href: string;
  features: RoleFeature[];
  visualIcon: ReactNode;
  primaryColor: string;
  buttonText: string;
}

/**
 * Download App button configuration
 */
export interface DownloadAppConfig {
  href: string;
  label: string;
  icon?: ReactNode;
}
