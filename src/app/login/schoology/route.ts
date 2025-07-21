
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
  const showDebug = process.env.NODE_ENV === 'development';
  if (showDebug) {
    const debugInfo = {
      message: "This is the server-side debugging view for /login/schoology.",
      variables: {
        SCHOOLOGY_CLIENT_ID: clientId || 'NOT FOUND',
        SCHOOLOGY_CLIENT_SECRET: clientSecret ? '********' : 'NOT FOUND',
        NEXT_PUBLIC_APP_URL: appUrl || 'NOT FOUND',
      },
      nextStep: "If variables are 'NOT FOUND', check your .env file. If they are present, the real logic will run in 5 seconds."
    };

    // Temporarily return JSON to show the variables this route can see.
    // I will remove this and enable the redirect after you confirm the variables are correct.
    return new Response(
        `<pre>${JSON.stringify(debugInfo, null, 2)}</pre>`, 
        { 
            headers: { 'Content-Type': 'text/html' },
        }
    );
  }
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
