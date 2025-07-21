
import { NextResponse } from 'next/server';
import { getRequestToken } from '@/lib/schoology';
import { cookies } from 'next/headers';
import { config } from 'dotenv';

// Load environment variables directly from .env file for this server-side route
config({ path: process.cwd() + '/.env' });


export async function GET() {
  const clientId = process.env.SCHOOLOGY_CLIENT_ID;
  const clientSecret = process.env.SCHOOLOGY_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // --- Start of Debugging Block ---
  // This console.log will appear in your server terminal, not the browser.
  console.log("--- Server-side /login/schoology Debug ---");
  console.log("SCHOOLOGY_CLIENT_ID:", clientId ? 'FOUND' : 'NOT FOUND');
  console.log("SCHOOLOGY_CLIENT_SECRET:", clientSecret ? 'FOUND' : 'NOT FOUND');
  console.log("NEXT_PUBLIC_APP_URL:", appUrl || 'NOT FOUND');
  console.log("-----------------------------------------");
  // --- End of Debugging Block ---


  if (!clientId || !clientSecret || !appUrl) {
    console.error('Schoology environment variables are not configured.');
    return NextResponse.json(
      { error: 'Application is not configured for Schoology login. Check .env file.' },
      { status: 500 }
    );
  }

  try {
    const { oauth_token, oauth_token_secret } = await getRequestToken();
    
    cookies().set('schoology_oauth_token_secret', oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    const authUrl = new URL('https://app.schoology.com/oauth/authorize');
    authUrl.searchParams.append('oauth_token', oauth_token);

    return NextResponse.redirect(authUrl.toString());

  } catch (error) {
    console.error('Failed to get Schoology request token:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: 'Could not connect to Schoology. Please try again later.', details: errorMessage },
      { status: 500 }
    );
  }
}
