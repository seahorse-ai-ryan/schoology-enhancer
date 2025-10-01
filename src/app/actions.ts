'use server';

import { cookies } from 'next/headers';

export async function loginWithSchoology(): Promise<string | null> {
  console.log("--- [STEP 1] loginWithSchoology invoked (refactored) ---");
  // Refactor: avoid build-time NEXT_PUBLIC_APP_URL. Let API compute callback from request origin.
  try {
    const authStartUrl = '/api/requestToken';
    console.log(`[STEP 2] Redirecting client to ${authStartUrl} to start OAuth.`);
    return authStartUrl;
  } catch (error) {
    console.error('[FATAL ERROR] Failed during Schoology login initiation (refactored):', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Could not start Schoology auth: ${errorMessage}`);
  }
}
