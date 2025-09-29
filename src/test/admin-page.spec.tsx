import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('Admin Tools Page', () => {
  it('renders headings and controls', async () => {
    const AdminPage = (await import('../app/admin/page')).default as React.FC;
    render(<AdminPage />);
    expect(screen.getByText('Admin Tools')).toBeInTheDocument();
    expect(screen.getByText('Bootstrap Admin Role')).toBeInTheDocument();
    expect(screen.getByText('Run Sandbox Seed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Grant Myself Admin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Seed/i })).toBeInTheDocument();
  });
});


