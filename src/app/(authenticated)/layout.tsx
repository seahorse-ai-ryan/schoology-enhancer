import { Header } from '@/components/layout/header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const cookieStore = await cookies();
  const demo = cookieStore.get('demo_session');
  const real = cookieStore.get('schoology_user_id');
  if (!demo && !real) {
    redirect('/');
  }
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
