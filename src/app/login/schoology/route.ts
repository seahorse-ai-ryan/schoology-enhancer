
import { NextResponse } from 'next/server';
import { getRequestToken } from '@/lib/schoology';
import { cookies } from 'next/headers';
import { config } from 'dotenv';

config({ path: process.cwd() + '/.env' });


export async function GET() {
  const clientId = process.env.SCHOOLOGY_CLIENT_ID;
  const clientSecret = process.env.SCHOOLOGY_CLIENT_SECRET;

  // Temporarily return the variables for debugging
  return NextResponse.json({
    message: "Debugging environment variables from /login/schoology route.",
    clientIdLoaded: !!clientId,
    clientIdLast4: clientId?.slice(-4) ?? "Not Found",
    clientSecretLoaded: !!clientSecret,
    clientSecretFirst4: clientSecret?.slice(0, 4) ?? "Not Found",
  });

  /*
  // Original Logic
  if (!clientId || !clientSecret) {
    console.error('Schoology client ID or secret is not configured.');
    return NextResponse.json(
      { error: 'Application is not configured for Schoology login.' },
      { status: 500 }
    );
  }

  try {
    const { oauth_token, oauth_token_secret } = await getRequestToken();
    
    // Store the token secret in a secure, HTTP-only cookie
    // This is crucial for the callback step
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
    return NextResponse.json(
      { error: 'Could not connect to Schoology. Please try again later.' },
      { status: 500 }
    );
  }
  */
}
