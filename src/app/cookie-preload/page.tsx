'use client';

import { useEffect } from 'react';

export default function CookiePreloadPage() {
  useEffect(() => {
    // Set cookie
    document.cookie = "setcookie=1; path=/; SameSite=None; Secure";
    
    // Close the popup window
    setTimeout(() => {
      window.close();
    }, 100);
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <p>Loading application...</p>
    </div>
  );
}
