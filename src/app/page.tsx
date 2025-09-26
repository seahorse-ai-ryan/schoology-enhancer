'use client';

import { useRouter } from 'next/navigation';
import { useDataMode } from '@/components/providers/DataModeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const { enterSampleMode, startRealLogin, showingSampleData } = useDataMode();

  const handleSample = () => {
    enterSampleMode();
    router.push('/dashboard');
  };

  const handleRealLogin = () => {
    startRealLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16 text-white">
        <header className="flex flex-col gap-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-white/10 backdrop-blur-sm" />
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-headline font-bold">Schoology Planner</h1>
            <p className="text-lg text-white/80">
              Stay ahead of coursework, monitor progress, and keep the whole family aligned with a smarter Schoology experience.
            </p>
          </div>
          {showingSampleData ? (
            <span className="mx-auto rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
              Sample Mode Active
            </span>
          ) : null}
        </header>

        <main className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/10 text-white shadow-xl backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-xl">Explore Sample Data</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-white/80">
                Jump into a guided experience featuring sample students and curated data. Perfect for demos, onboarding, and testing the Planner UI.
              </p>
              <Button variant="secondary" onClick={handleSample} data-testid="sample-button">
                Explore Sample Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white text-slate-900 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Connect to Schoology</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Sign in with your Schoology parent account to view real student data, course activity, and alerts personalized to your family.
              </p>
              <Button onClick={handleRealLogin} data-testid="real-login-button">
                Sign In with Schoology
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
