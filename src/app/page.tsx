'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  // On landing, if already authenticated, send to dashboard
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/status', { cache: 'no-store' });
        if (res.ok) router.replace('/dashboard');
      } catch (_) {}
    })();
  }, [router]);

  const handleLogin = () => {
    window.location.href = '/api/requestToken';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-24 text-white">
        <header className="flex flex-col gap-6 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-bold">Schoology Planner</h1>
            <p className="text-xl text-white/90">
              Stay ahead of coursework, monitor progress, and keep the whole family aligned with a smarter Schoology experience.
            </p>
          </div>
        </header>

        <main className="flex flex-col items-center gap-8">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Get Started</h2>
                <p className="text-sm text-slate-600">
                  Sign in with your Schoology parent account to view real student data, course activity, and personalized alerts for your family.
                </p>
              </div>
              <Button 
                onClick={handleLogin} 
                size="lg"
                className="w-full"
                data-testid="real-login-button"
              >
                Sign In with Schoology
              </Button>
            </div>
          </div>
          
          <div className="text-center text-white/60 text-sm">
            <p>Secure OAuth authentication powered by Schoology</p>
          </div>
        </main>
      </div>
    </div>
  );
}
