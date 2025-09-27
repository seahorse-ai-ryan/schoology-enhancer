'use client';

import { useEffect } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Initialize MSW in development
      const initMSW = async () => {
        try {
          // Avoid noisy 404s if the service worker asset is not present
          const swUrl = '/mockServiceWorker.js';
          const head = await fetch(swUrl, { method: 'HEAD' });
          if (!head.ok) {
            console.log('MSW skipped: service worker asset not found');
            return;
          }

          const { worker } = await import('@/mocks/browser');
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: { url: swUrl },
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
