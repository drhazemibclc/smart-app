// src/components/patients/PatientCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PatientCard } from './patient-card';
describe('PatientCard', () => {
  const mockPatient: any = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date(new Date().getFullYear() - 5, 0, 1),
    gender: 'MALE',
    colorCode: '#4ECDC4',
    createdAt: new Date(),
    email: 'john@example.com',
    phone: '123456789',
    status: 'ACTIVE',
    image: null,
    _count: { appointments: 0, medicalRecords: 0, prescriptions: 0 }
  };

  it('renders patient information', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/5 years/)).toBeInTheDocument();
  });

  it('renders the dropdown menu', async () => {
    render(<PatientCard patient={mockPatient} />);
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
  });
});
