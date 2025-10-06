'use client';

import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { BookOpenCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  const handleLogoClick = () => {
    // Navigate to dashboard (users in this layout are already authenticated)
    router.push('/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <button
          type="button"
          aria-label="Schoology Planner home"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={handleLogoClick}
        >
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <span className="text-xl font-headline font-bold text-primary">
            Schoology Planner
          </span>
        </button>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <MainNav className="mx-6" />
          <nav className="flex items-center space-x-4">
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}