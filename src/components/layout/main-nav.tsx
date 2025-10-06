'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function MainNav({ className, ...props }: HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/courses', label: 'Courses' },
    { href: '/announcements', label: 'Announcements' },
  ];

  return (
    <nav
      className={cn('hidden md:flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === route.href
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
