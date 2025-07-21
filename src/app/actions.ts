'use server';

import { getRequestToken } from '@/lib/schoology';
import { cookies } from 'next/headers';
import { config } from 'dotenv';
import { resolve } from 'path';

export async function loginWithSchoology(): Promise<string | null> {
  // Explicitly load .env file from the project root
  config({ path: resolve(process.cwd(), '.env') });
  
  console.log("--- [STEP 1] loginWithSchoology Server Action hit ---");
  
  const clientId = process.env.SCHOOLOGY_CLIENT_ID;
  const clientSecret = process.env.SCHOOLOGY_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  console.log(`[STEP 2] Loading variables:`);
  console.log(` > SCHOOLOGY_CLIENT_ID: ${clientId ? 'FOUND' : 'NOT FOUND'}`);
  console.log(` > SCHOOLOGY_CLIENT_SECRET: ${clientSecret ? 'FOUND' : 'NOT FOUND'}`);
  console.log(` > NEXT_PUBLIC_APP_URL: ${appUrl || 'NOT FOUND'}`);

  if (!clientId || !clientSecret || !appUrl) {
    console.error('[ERROR] Schoology environment variables are not configured in Server Action.');
    throw new Error('Application is not configured for Schoology login.');
  }

  try {
    console.log("[STEP 3] Calling getRequestToken()...");
    const { oauth_token, oauth_token_secret } = await getRequestToken();
    console.log(`[STEP 5] Received request token from Schoology: ${oauth_token}`);
    
    cookies().set('schoology_oauth_token_secret', oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });
    console.log('[STEP 6] Saved oauth_token_secret to a secure cookie.');

    const authUrl = new URL('https://app.schoology.com/oauth/authorize');
    authUrl.searchParams.append('oauth_token', oauth_token);
    console.log(`[STEP 7] Generated auth URL. Returning to client: ${authUrl.toString()}`);

    return authUrl.toString();

  } catch (error) {
    console.error('[FATAL ERROR] Failed during Schoology login initiation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Could not connect to Schoology: ${errorMessage}`);
  }
}
