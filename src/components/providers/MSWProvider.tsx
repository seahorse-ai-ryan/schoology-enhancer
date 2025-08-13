'use client';

import { useEffect } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Initialize MSW in development
      const initMSW = async () => {
        try {
          const { worker } = await import('@/mocks/browser');
          await worker.start({
            onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
          });
          console.log('MSW started in development mode');
        } catch (error) {
          console.log('MSW not available:', error);
        }
      };
      
      initMSW();
    }
  }, []);

  return <>{children}</>;
}
