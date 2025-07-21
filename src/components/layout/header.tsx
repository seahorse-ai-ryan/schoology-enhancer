import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <Link href="/dashboard">
                <h1 className="text-xl font-headline font-bold text-primary">
                GradeWise
                </h1>
            </Link>
        </div>

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
