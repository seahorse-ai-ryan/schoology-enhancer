'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PERSONA_PROFILES, SAMPLE_PARENT_PROFILE, type PersonaProfile } from '@/lib/mock-data';

export type DataMode = 'real' | 'mock' | null;

interface DataModeContextValue {
  mode: DataMode;
  personas: PersonaProfile[];
  activePersonaId: string | null;
  showingSampleData: boolean;
  sampleParent: typeof SAMPLE_PARENT_PROFILE;
  setActivePersona: (personaId: string) => void;
  enterSampleMode: () => void;
  exitSampleMode: () => void;
  startRealLogin: () => void;
  logout: () => void;
}

const STORAGE_KEY_MODE = 'schoology-planner-mode';
const STORAGE_KEY_PERSONA = 'schoology-planner-persona';

const DataModeContext = createContext<DataModeContextValue | undefined>(undefined);

export function DataModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<DataMode>(null);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);

  useEffect(() => {
    const storedMode = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_MODE) : null;
    const storedPersona = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PERSONA) : null;

    if (storedMode === 'mock') {
      setMode('mock');
    }

    if (storedPersona) {
      setActivePersonaId(storedPersona);
    } else if (PERSONA_PROFILES.length > 0) {
      setActivePersonaId(PERSONA_PROFILES[0].id);
    }
  }, []);

  // If the user is authenticated, force real mode and override any stale local sample flag
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/status', { cache: 'no-store' });
        if (res.ok) {
          setMode('real');
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_MODE, 'real');
            localStorage.removeItem(STORAGE_KEY_PERSONA);
          }
        }
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mode === 'mock') {
      localStorage.setItem(STORAGE_KEY_MODE, 'mock');
    } else if (mode === 'real') {
      localStorage.setItem(STORAGE_KEY_MODE, 'real');
    } else {
      localStorage.removeItem(STORAGE_KEY_MODE);
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activePersonaId) {
      localStorage.setItem(STORAGE_KEY_PERSONA, activePersonaId);
    }
  }, [activePersonaId]);

  const enterSampleMode = () => {
    (async () => {
      try {
        // Server will set HttpOnly demo_session cookie and redirect to /dashboard
        const res = await fetch('/api/demo/start', { method: 'GET', redirect: 'follow' as any });
        setMode('mock');
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_MODE, 'mock');
          // navigate if not auto-followed by the browser
          if (res && 'url' in res && (res as any).url) {
            window.location.href = (res as any).url as string;
          } else {
            window.location.href = '/dashboard';
          }
        }
      } catch (_) {
        // Fallback to client redirect
        setMode('mock');
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_MODE, 'mock');
          window.location.href = '/dashboard';
        }
      }
    })();
  };

  const exitSampleMode = () => {
    setMode(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_MODE);
      localStorage.removeItem(STORAGE_KEY_PERSONA);
    }
  };

  const startRealLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/requestToken';
    }
  };

  const logout = () => {
    (async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (_) {
        // ignore network errors on logout
      }
      exitSampleMode();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    })();
  };

  const value = useMemo<DataModeContextValue>(
    () => ({
      mode,
      personas: PERSONA_PROFILES,
      activePersonaId,
      showingSampleData: mode === 'mock',
      sampleParent: SAMPLE_PARENT_PROFILE,
      setActivePersona: setActivePersonaId,
      enterSampleMode,
      exitSampleMode,
      startRealLogin,
      logout,
    }),
    [mode, activePersonaId]
  );

  return <DataModeContext.Provider value={value}>{children}</DataModeContext.Provider>;
}

export function useDataMode(): DataModeContextValue {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
}

