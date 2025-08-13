'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email?: string;
}

export function LoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('User not authenticated');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Redirect to our OAuth request token endpoint
      window.location.href = '/requestToken';
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {user.name}!
        </span>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-sm"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleLogin} 
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {loading ? 'Signing in...' : 'Sign in with Schoology'}
    </Button>
  );
}

