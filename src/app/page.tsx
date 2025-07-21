'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import { loginWithSchoology } from './actions';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectUrl = await loginWithSchoology();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setError('Could not get redirect URL from server.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex items-center gap-2 mb-6">
        <BookOpenCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-primary">
          GradeWise
        </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Connect to Schoology</CardTitle>
          <CardDescription>
            Link your Schoology account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" size="lg" onClick={handleLogin} disabled={loading}>
            {loading ? 'Connecting...' : 'Login with Schoology'}
          </Button>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </CardContent>
        <CardFooter className="flex-col text-center justify-center gap-2">
          <p className="text-xs text-muted-foreground">
            You will be redirected to Schoology to authorize this app.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
