import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { doc, setDoc, getDoc } from 'firebase/firestore';

// LAZY INITIALIZATION FOR OAUTH
let oauth: OAuth | null = null;
const getOauth = () => {
  if (!oauth) {
    oauth = new OAuth({
      consumer: {
        key: process.env.SCHOOLOGY_CONSUMER_KEY as string,
        secret: process.env.SCHOOLOGY_CONSUMER_SECRET as string,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });
  }
  return oauth;
};

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const SCHOOLOGY_APP_URL = 'https://app.schoology.com';

export async function GET(request: Request) {
  const request_data = {
    url: `${SCHOOLOGY_API_URL}/oauth/request_token`,
    method: 'GET',
  };

  try {
    const oauthClient = getOauth(); // Get the initialized client
    const authHeader = oauthClient.toHeader(oauthClient.authorize(request_data));

    const response = await fetch(request_data.url, {
      method: request_data.method,
      headers: {
          ...authHeader,
          // 'Content-Type': 'application/json', // Adjust content type if needed by Schoology
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get request token: ${response.status} ${errorText}`);
      return NextResponse.json({ error: `Failed to get request token: ${errorText}` }, { status: 500 });
    }

    const responseData = await response.text();
    const requestToken = new URLSearchParams(responseData);

    const token_key = requestToken.get('oauth_token');
    const token_secret = requestToken.get('oauth_token_secret');

    if (!token_key || !token_secret) {
        console.error('Missing token key or secret in request token response.');
        return NextResponse.json({ error: 'Invalid response from Schoology.' }, { status: 500 });
    }

    // Step 1.5: Save the request token and secret to Firestore
    // We'll use the token_key as the document ID for this temporary token.
    const tokenDocRef = doc(db, 'oauthTokens', token_key);
    try {
        await setDoc(tokenDocRef, {
            token_key: token_key,
            token_secret: token_secret,
            is_access_token: false,
            createdAt: new Date(), // Optional: add a timestamp
        });
        console.log('Saved request token to Firestore with doc ID:', token_key);

    } catch (firestoreError) {
        console.error('Error saving request token to Firestore:', firestoreError);
        return NextResponse.json({ error: 'Failed to save token.' }, { status: 500 });
    }

    // Step 2: Redirect user to Schoology for authorization, with the callback URL as a query param
    // Use the app's base URL from environment variables
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appBaseUrl) {
        console.error('NEXT_PUBLIC_APP_URL is not set.');
        return NextResponse.json({ error: 'Application URL is not configured.' }, { status: 500 });
    }
    const callbackUrl = encodeURIComponent(`${appBaseUrl}/api/auth/callback/schoology`);
    const redirectUrl = `${SCHOOLOGY_APP_URL}/oauth/authorize?oauth_token=${token_key}&oauth_callback=${callbackUrl}`;

    // In Next.js API routes, you can return a redirect response
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Error in Schoology auth initiation:', error);
    return NextResponse.json({ error: 'Authentication initiation failed.' }, { status: 500 });
  }
}
