import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

import { DataModeProvider } from '@/components/providers/DataModeProvider';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { Header } from '@/components/layout/header';

// Mock SchoologyDataService so dashboard doesn't hit Firestore
const mockDataService = {
  getCourses: jest.fn(),
  getAnnouncements: jest.fn(),
  getDeadlines: jest.fn(),
  getDataSourceSummary: jest.fn(),
};

jest.mock('@/lib/schoology-data', () => ({
  SchoologyDataService: jest.fn().mockImplementation(() => mockDataService),
}));

// Mock Next router for logo navigation assertions
jest.mock('next/navigation', () => {
  const push = jest.fn();
  return { useRouter: () => ({ push }) };
});

function withProviders(children: React.ReactNode) {
  return <DataModeProvider>{children}</DataModeProvider>;
}

describe('Demo flows (unit-ish)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Simulate unauthenticated so dashboard loads mock/user path without erroring
    // fetch is used only for /api/auth/status; ok=false ensures mock path in component
    // but we still mock data service for deterministic content
    (global.fetch as unknown as jest.Mock) = jest
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({}) });
  });

  it('renders dashboard with mock provenance', async () => {
    mockDataService.getCourses.mockResolvedValue([
      {
        id: 'c1',
        code: 'CALC101',
        name: 'Calculus',
        subject: 'Math',
        gradeLevel: '10',
        credits: 1,
        academicYear: '2024-2025',
        semester: 'Fall',
        teacher: { id: 't1', name: 'Dr. Euler', email: 'e@example.com', department: 'Math' },
        description: 'Intro',
        objectives: [],
        prerequisites: [],
        isActive: true,
        startDate: new Date(),
        endDate: new Date(),
        lastUpdated: new Date(),
        dataSource: 'mock',
        sourceTimestamp: new Date(),
        metadata: { totalStudents: 20, totalAssignments: 5, difficulty: 'intermediate', tags: [] },
      },
    ]);
    mockDataService.getAnnouncements.mockResolvedValue([]);
    mockDataService.getDeadlines.mockResolvedValue([]);
    mockDataService.getDataSourceSummary.mockResolvedValue({
      courses: 'mock',
      announcements: 'mock',
      grades: 'mock',
      lastUpdated: new Date(),
      dataQuality: 'good',
      syncStatus: 'synced',
    });

    render(withProviders(<UserDashboard />));

    await waitFor(() => screen.getByTestId('dashboard-content'));
    // Quick regression guard: provenance wrapper exists and shows Mock at least once
    expect(screen.getByTestId('provenance')).toBeInTheDocument();
    expect(screen.getAllByText('Mock').length).toBeGreaterThan(0);
  });

  it('switches persona via user menu and updates label', async () => {
    render(withProviders(<Header />));

    // Open avatar menu
    fireEvent.click(screen.getByTestId('user-avatar-trigger'));

    // Click second persona (joe-struggling)
    const option = await screen.findByTestId('persona-joe-struggling');
    fireEvent.click(option);

    // Menu label should reflect selected persona name (Joe) somewhere in menu
    await waitFor(() => expect(screen.getByText(/Joe/i)).toBeInTheDocument());
  });

  it('logout triggers redirect to landing', async () => {
    // Make window.location writable for test
    const original = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' };

    render(withProviders(<Header />));

    fireEvent.click(screen.getByTestId('user-avatar-trigger'));
    const logout = await screen.findByTestId('logout');
    fireEvent.click(logout);

    expect(window.location.href).toBe('/');

    // restore
    window.location = original;
  });
});


