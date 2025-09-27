import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Header } from '@/components/layout/header';
import { DataModeProvider } from '@/components/providers/DataModeProvider';

describe('Logout wipes demo and real session', () => {
  beforeEach(() => {
    (global.fetch as unknown as jest.Mock) = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    window.localStorage.clear();
  });

  it('calls /api/auth/logout and clears localStorage via exitSampleMode', async () => {
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' };

    // Pre-populate demo markers to ensure they are removed
    localStorage.setItem('schoology-planner-mode', 'mock');
    localStorage.setItem('schoology-planner-persona', 'jane-excellent');

    render(
      <DataModeProvider>
        <Header />
      </DataModeProvider>
    );

    fireEvent.click(screen.getByTestId('user-avatar-trigger'));
    const logout = await screen.findByTestId('logout');
    fireEvent.click(logout);

    await waitFor(() => expect((global.fetch as jest.Mock)).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' }));
    expect(localStorage.getItem('schoology-planner-mode')).toBeNull();
    expect(localStorage.getItem('schoology-planner-persona')).toBeNull();
    expect(window.location.href).toBe('/');

    window.location = originalLocation;
  });
});


