import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authorizationCode = searchParams.get('oauth_token'); // Schoology uses oauth_token for the auth code
  const state = searchParams.get('state');

  if (!authorizationCode) {
    return NextResponse.json(
      { error: 'Authorization code not found.' },
      { status: 400 }
    );
  }

  // TODO:
  // 1. Verify the 'state' parameter matches the one you sent.
  // 2. Exchange the authorization code for an access token by making a POST request to Schoology.
  // 3. Use the access token to fetch user data.
  // 4. Create a session for the user (e.g., using cookies).

  console.log('Received authorization code:', authorizationCode);

  // For now, we will redirect to the dashboard after receiving the code.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  return NextResponse.redirect(`${appUrl}/dashboard`);
}
