
import { NextResponse, type NextRequest } from 'next/server';
import { getAccessToken } from '@/lib/schoology';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const oauth_token = searchParams.get('oauth_token');
  const oauth_verifier = searchParams.get('oauth_verifier'); // Schoology provides this

  const cookieStore = cookies();
  const oauth_token_secret = cookieStore.get('schoology_oauth_token_secret')?.value;

  if (!oauth_token || !oauth_token_secret) {
    return NextResponse.json(
      { error: 'Invalid callback request. Token or secret missing.' },
      { status: 400 }
    );
  }

  try {
    const { 
        oauth_token: access_token, 
        oauth_token_secret: access_token_secret 
    } = await getAccessToken(oauth_token, oauth_token_secret, oauth_verifier || '');

    // At this point, you have the access token and secret.
    // You should save these securely, associate them with the user,
    // and create a user session for your app.
    console.log('Successfully received access token:', access_token);

    // Clear the temporary cookie
    cookieStore.delete('schoology_oauth_token_secret');

    // Create a session for the user (e.g., using another cookie)
    // For now, redirect to the dashboard.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    return NextResponse.redirect(`${appUrl}/dashboard`);

  } catch (error) {
    console.error('Failed to exchange for access token:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Schoology.' },
      { status: 500 }
    );
  }
}
