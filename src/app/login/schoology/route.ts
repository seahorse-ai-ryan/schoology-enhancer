import { NextResponse } from 'next/server';

export function GET() {
  console.log('Attempting to log in with Schoology...');
  const clientId = process.env.SCHOOLOGY_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId || !appUrl) {
    console.error('Schoology client ID or App URL is not configured in .env');
    
    // Enhanced debugging response
    const debugInfo = {
      error: 'Application is not configured for Schoology login.',
      diagnostics: {
        clientIdLoaded: !!clientId,
        clientIdLast4: clientId ? `...${clientId.slice(-4)}` : 'Not Found',
        appUrlLoaded: !!appUrl,
        appUrlValue: appUrl || 'Not Found',
        message:
          'Please ensure SCHOOLOGY_CLIENT_ID and NEXT_PUBLIC_APP_URL are correctly set in your .env file.',
      },
    };

    return NextResponse.json(debugInfo, { status: 500 });
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
