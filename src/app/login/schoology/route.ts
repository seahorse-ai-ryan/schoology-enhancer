import { NextResponse, type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const clientId = process.env.SCHOOLOGY_CLIENT_ID;

  if (!clientId) {
    console.error('Schoology client ID is not configured.');
    // This response is for debugging in the dev environment.
    // In production, you'd want a more user-friendly error page.
    return NextResponse.json(
      { error: 'Application is not configured for Schoology login.' },
      { status: 500 }
    );
  }

  // Dynamically determine the app's URL from the request headers.
  // This makes it work in any environment (dev, prod, etc.)
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  const appUrl = `${protocol}://${host}`;

  // This is the callback URL that Schoology will redirect to after the user authorizes.
  const redirectUri = `${appUrl}/api/auth/callback/schoology`;

  const authUrl = new URL('https://app.schoology.com/oauth/authorize');
  authUrl.searchParams.append('oauth_callback', redirectUri);
  // Note: For Schoology's OAuth 1.0a-based flow, the client_id is often part of the request token step,
  // but for the initial user authorization redirect, they just require the callback.
  // Let's also add client_id just in case their flow requires it for identification.
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code'); // Requesting an authorization code
  authUrl.searchParams.append('state', 'dummy_state_for_now'); // Should be a random, secure value per request

  // Redirect the user to Schoology's authorization page
  return NextResponse.redirect(authUrl.toString());
}
