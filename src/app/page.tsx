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
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // We no longer use the router directly.
    // The Link component will handle navigation.
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
          <CardContent>
            <Link href="/login/schoology" legacyBehavior>
                <a onClick={handleLogin}>
                    <Button className="w-full" size="lg" disabled={loading}>
                        {loading ? 'Connecting...' : 'Login with Schoology'}
                    </Button>
                </a>
            </Link>
          </CardContent>
           <CardFooter className="text-center justify-center">
              <p className="text-xs text-muted-foreground">
                You will be redirected to Schoology to authorize this app.
              </p>
          </CardFooter>
        </Card>
    </main>
  );
}
