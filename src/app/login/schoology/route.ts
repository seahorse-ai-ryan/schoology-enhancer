
import { NextResponse } from 'next/server';
import { getRequestToken } from '@/lib/schoology';
import { cookies } from 'next/headers';
import { config } from 'dotenv';

// Load environment variables directly from .env file for this server-side route
config({ path: process.cwd() + '/.env' });


export async function GET() {
  console.log("--- [STEP 1] /login/schoology route hit ---");
  
  const clientId = process.env.SCHOOLOGY_CLIENT_ID;
  const clientSecret = process.env.SCHOOLOGY_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  console.log(`[STEP 2] Loading variables:`);
  console.log(` > SCHOOLOGY_CLIENT_ID: ${clientId ? 'FOUND' : 'NOT FOUND'}`);
  console.log(` > SCHOOLOGY_CLIENT_SECRET: ${clientSecret ? 'FOUND' : 'NOT FOUND'}`);
  console.log(` > NEXT_PUBLIC_APP_URL: ${appUrl || 'NOT FOUND'}`);

  if (!clientId || !clientSecret || !appUrl) {
    console.error('[ERROR] Schoology environment variables are not configured.');
    return NextResponse.json(
      { 
        error: 'Application is not configured for Schoology login.',
        details: 'Server is missing one or more required environment variables (SCHOOLOGY_CLIENT_ID, SCHOOLOGY_CLIENT_SECRET, NEXT_PUBLIC_APP_URL). Check the .env file and server logs.'
      },
      { status: 500 }
    );
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
    console.log(`[STEP 7] Generated auth URL. Redirecting user to: ${authUrl.toString()}`);

    return NextResponse.redirect(authUrl.toString());

  } catch (error) {
    console.error('[FATAL ERROR] Failed during Schoology login initiation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: 'Could not connect to Schoology.', details: errorMessage },
      { status: 500 }
    );
  }
}
