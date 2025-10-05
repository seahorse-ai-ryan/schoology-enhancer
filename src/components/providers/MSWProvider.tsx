'use client';

// MSWProvider removed - we use real Schoology authentication
// MSW is only used for backend unit tests, not in the browser
export function MSWProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
