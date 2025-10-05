
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import { config } from 'dotenv';
import { resolve } from 'path';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

// Lazy Initializer for the OAuth client
let oauthClient: OAuth | null = null;

const getOauthClient = () => {
  // Only initialize the client if it hasn't been already.
  if (oauthClient) {
    return oauthClient;
  }

  // Explicitly load .env file from the project root just-in-time.
  // This ensures that no matter how the server is started, we find the file.
  const envPath = resolve(process.cwd(), '.env');
  config({ path: envPath });

  const clientId = process.env.SCHOOLOGY_CLIENT_ID;
  const clientSecret = process.env.SCHOOLOGY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    // This log will now correctly fire if the variables are missing after attempting to load them.
    console.error(`[schoology.ts] Schoology Client ID or Secret is not configured. Attempted to load from: ${envPath}`);
    throw new Error('Schoology Client ID or Secret is not configured in environment variables.');
  }

  // Create the singleton instance.
  oauthClient = new OAuth({
    consumer: {
      key: clientId,
      secret: clientSecret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });

  return oauthClient;
}


export async function getRequestToken() {
  const oauth = getOauthClient();
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/schoology`;
  console.log(`[STEP 3a] Callback URL for request token: ${callbackUrl}`);

  const requestData = {
    url: `${SCHOOLOGY_API_URL}/oauth/request_token`,
    method: 'GET',
    data: {
        oauth_callback: callbackUrl,
    }
  };

  console.log('[STEP 3b] Making fetch request to Schoology for request token...');
  const response = await fetch(requestData.url, {
    method: requestData.method,
    headers: oauth.toHeader(oauth.authorize(requestData)) as unknown as HeadersInit,
  });

  const responseText = await response.text();
  console.log(`[STEP 4] Received response from Schoology. Status: ${response.status}. Body: ${responseText}`);

  if (!response.ok) {
    throw new Error(`Failed to get request token: ${response.status} ${responseText}`);
  }

  const params = new URLSearchParams(responseText);

  return {
    oauth_token: params.get('oauth_token')!,
    oauth_token_secret: params.get('oauth_token_secret')!,
  };
}

export async function getAccessToken(
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string
) {
    const oauth = getOauthClient();
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
        headers: oauth.toHeader(oauth.authorize(requestData, token)) as unknown as HeadersInit,
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

export async function getSchoologyUser(accessToken: { key: string; secret: string }) {
    const oauth = getOauthClient();
    const requestData = {
        url: `${SCHOOLOGY_API_URL}/users/me`,
        method: 'GET',
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData, accessToken));

    const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
            ...authHeader,
            'Content-Type': 'application/json', // Schoology API often expects JSON
            'Accept': 'application/json', // Request JSON response
        },
    });

    if (!response.ok) {
        const text = await response.text();
        console.error(`Failed to fetch Schoology user: ${response.status} ${text}`);
        throw new Error(`Failed to fetch Schoology user: ${response.status} ${text}`);
    }

    const userData = await response.json();
    console.log('Fetched Schoology user data:', userData);
    return userData; // Return the user data object
}
