import { NextResponse } from 'next/server';

export function GET() {
  const clientId = process.env.SCHOOLOGY_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId || !appUrl) {
    console.error('Schoology client ID or App URL is not configured.');
    return NextResponse.json(
        { error: 'Application is not configured for Schoology login.'},
        { status: 500 }
    );
  }

  // This is the callback URL that Schoology will redirect to after the user authorizes.
  const redirectUri = `${appUrl}/api/auth/callback/schoology`;

  const authUrl = new URL('https://app.schoology.com/oauth/authorize');
  authUrl.searchParams.append('oauth_callback', redirectUri);
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', 'dummy_state_for_now'); // Should be a random, secure value per request

  // Redirect the user to Schoology's authorization page
  return NextResponse.redirect(authUrl.toString());
}
