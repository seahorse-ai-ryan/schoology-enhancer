import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getSchoologyUser } from '@/lib/schoology'; // Import the new function
import { cookies } from 'next/headers'; // Import cookies

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const request_token_key = searchParams.get('oauth_token');
  const oauth_verifier = searchParams.get('oauth_verifier');

  console.log('--- [STEP 3] /api/auth/callback/schoology hit ---');
  console.log('Received:', { request_token_key, oauth_verifier });

  if (!request_token_key || !oauth_verifier) {
    console.error('Missing oauth_token or oauth_verifier in callback query params.');
    return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
  }

  try {
    // Retrieve the request token secret from Firestore
    const requestTokenDocRef = doc(db, 'oauthTokens', request_token_key);
    const requestTokenDoc = await getDoc(requestTokenDocRef);

    if (!requestTokenDoc.exists() || requestTokenDoc.data().is_access_token) {
      console.error('Could not find matching request token in Firestore or it is an access token.');
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    const { token_secret: request_token_secret } = requestTokenDoc.data();
    console.log('Retrieved request token secret from Firestore.');

    // Exchange request token for access token
    const accessToken = await getAccessToken(
      request_token_key,
      request_token_secret,
      oauth_verifier
    );

    console.log('[STEP 6] Received Access Token:', accessToken);

    // Fetch Schoology user data using the access token
    console.log('[STEP 7] Fetching Schoology user data...');
    const schoologyUser = await getSchoologyUser(accessToken);
    console.log('[STEP 8] Fetched Schoology user:', schoologyUser);

    if (!schoologyUser || !schoologyUser.id) {
        console.error('Failed to fetch Schoology user data or user ID is missing.');
        return NextResponse.json({ error: 'Could not retrieve user information from Schoology.' }, { status: 500 });
    }

    const schoologyUserId = String(schoologyUser.id); // Ensure user ID is a string for Firestore doc ID

    // Step 9: Save or update user information and access token in Firestore
    try {
        // Use the Schoology user ID as the document ID for the user in a 'users' collection
        const userDocRef = doc(db, 'users', schoologyUserId);

        // Check if user already exists
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Create a new user document if they don't exist
            await setDoc(userDocRef, {
                schoologyId: schoologyUserId,
                name: schoologyUser.name_display || schoologyUser.name_first + ' ' + schoologyUser.name_last || 'Unnamed User', // Use display name or first+last
                createdAt: new Date(),
                // Add other relevant user data you get from Schoology API
            });
            console.log('Created new user document in Firestore with ID:', schoologyUserId);
        } else {
             console.log('User document already exists for ID:', schoologyUserId);
             // You might want to update user information here if needed
        }

        // Save the access token linked to the user document
        await setDoc(userDocRef, {
            accessToken: accessToken.key,
            accessTokenSecret: accessToken.secret,
            accessTokenCreatedAt: new Date(), // Timestamp for the access token
        }, { merge: true }); // Use merge to update without overwriting existing fields

        console.log('Saved/updated access token for user:', schoologyUserId);

        // Delete the temporary request token document
        await deleteDoc(requestTokenDocRef);
        console.log('Deleted temporary request token from Firestore.');

        // Set a cookie to indicate successful authentication and store the user ID
        cookies().set('schoology_user_id', schoologyUserId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
            sameSite: 'lax',
        });
        console.log('Set schoology_user_id cookie.');

    } catch (firestoreError) {
        console.error('Error saving user and access token to Firestore:', firestoreError);
        // It's important to still try to redirect the user even if saving failed
        // but you might want to add an error indicator in the redirect URL.
         const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
         const redirectUrl = appBaseUrl ? `${appBaseUrl}?auth_error=1` : '/';
         return NextResponse.redirect(redirectUrl);
    }

    // Step 10: Redirect the user back to the client application
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
     if (!appBaseUrl) {
        console.error('NEXT_PUBLIC_APP_URL is not set for redirect.');
        return NextResponse.json({ error: 'Application URL is not configured for redirect.' }, { status: 500 });
    }
    console.log(`[STEP 10] Redirecting to client: ${appBaseUrl}`);
    return NextResponse.redirect(appBaseUrl);

  } catch (error) {
    console.error('Error in Schoology auth callback:', error);
    // Redirect with an error indicator if the main auth flow fails
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const redirectUrl = appBaseUrl ? `${appBaseUrl}?auth_error=1` : '/';
    return NextResponse.redirect(redirectUrl);
  }
}

// Helper function to get access token (already exists in src/lib/schoology.ts, but included here for clarity)
async function getAccessToken(
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string
) {
    const oauth = getOauth(); // Use the local getOauth in the API route for consistency
    const requestData = {
        url: `${SCHOOLOGY_API_URL}/oauth/access_token`,
        method: 'GET',
    };

    const token = {
        key: oauth_token,
        secret: oauth_token_secret,
    };

    const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: oauth.toHeader(oauth.authorize(requestData, token, { oauth_verifier })), // Include oauth_verifier
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to get access token: ${response.status} ${text}`);
    }

    const responseData = await response.text();
    const params = new URLSearchParams(responseData);
    
    return {
        oauth_token: params.get('oauth_token')!,
        oauth_token_secret: params.get('oauth_token_secret')!,
    };
}
