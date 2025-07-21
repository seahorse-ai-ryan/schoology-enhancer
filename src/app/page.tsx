'use client';

import { useState, useEffect } from 'react';
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
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [formattedBuildTime, setFormattedBuildTime] = useState('');
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;

  useEffect(() => {
    if (buildTime) {
      setFormattedBuildTime(new Date(buildTime).toLocaleTimeString());
    }
  }, [buildTime]);

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
        <CardContent>
          <Link href="/login/schoology" passHref>
            <Button as="a" className="w-full" size="lg" onClick={() => setLoading(true)}>
              {loading ? 'Connecting...' : 'Login with Schoology'}
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="flex-col text-center justify-center gap-2">
          <p className="text-xs text-muted-foreground">
            You will be redirected to Schoology to authorize this app.
          </p>
          {formattedBuildTime && (
            <p className="text-xs text-muted-foreground/50">
              Build: {formattedBuildTime}
            </p>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
