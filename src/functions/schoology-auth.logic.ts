// src/functions/schoology-auth.logic.ts
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const getOauth = (key, secret) => {
  return new OAuth({
    consumer: { key, secret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, k) {
      return crypto.createHmac('sha1', k).update(base_string).digest('base64');
    },
  });
};

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const SCHOOLOGY_APP_URL = 'https://app.schoology.com';

// Firestore (admin) is required in dev/prod; do not fall back when emulators are down.

export const requestTokenLogic = async (db, consumerKey, consumerSecret, callbackUrl: string) => {
  if (!db) throw new Error('Firestore admin not initialized. Start emulators or configure admin.');
  const oauthClient = getOauth(consumerKey, consumerSecret);
  // Include oauth_callback in the signed request per OAuth 1.0a spec
  const request_data: any = {
    url: `${SCHOOLOGY_API_URL}/oauth/request_token`,
    method: 'GET',
    data: { oauth_callback: callbackUrl },
  };

  const authHeader = oauthClient.toHeader(oauthClient.authorize(request_data));
  const headers = new Headers();
  for (const key in authHeader) headers.append(key, (authHeader as any)[key]);
  headers.append('Accept', 'application/x-www-form-urlencoded');

  const url = new URL(request_data.url);
  url.searchParams.set('oauth_callback', callbackUrl);

  const response = await fetch(url.toString(), { headers });
  if(!response.ok) throw new Error("Request Token failed");
  const responseData = await response.text();
  const requestTokenData = new URLSearchParams(responseData);
  const token_key = requestTokenData.get('oauth_token');
  const token_secret = requestTokenData.get('oauth_token_secret');
  if (token_key && token_secret) {
    await db.collection('oauth_tokens').doc(token_key).set({ secret: token_secret, timestamp: Date.now() });
  } else {
    throw new Error('Missing oauth_token or oauth_token_secret from request token response');
  }
  const authorizeUrl = new URL(`${SCHOOLOGY_APP_URL}/oauth/authorize`);
  authorizeUrl.searchParams.set('oauth_token', token_key!);
  authorizeUrl.searchParams.set('oauth_callback', callbackUrl);
  return authorizeUrl.toString();
};

export const callbackLogic = async (
  db,
  consumerKey,
  consumerSecret,
  oauth_token: string,
  oauth_verifier: string | null,
) => {
    if (!db) throw new Error('Firestore admin not initialized. Start emulators or configure admin.');
    const oauthClient = getOauth(consumerKey, consumerSecret);

    // Retrieve request token secret from Firestore or in-memory fallback
    let request_token_secret: string | null = null;
    const tokenDoc = await db.collection('oauth_tokens').doc(oauth_token).get();
    if (tokenDoc.exists) request_token_secret = tokenDoc.data().secret;
    if (!request_token_secret) throw new Error('Token not found');

    const access_token_data: any = { url: `${SCHOOLOGY_API_URL}/oauth/access_token`, method: 'GET', data: {} };
    if (oauth_verifier) access_token_data.data.oauth_verifier = oauth_verifier;
    const request_token = { key: oauth_token, secret: request_token_secret };

    const accessAuthHeader = oauthClient.toHeader(oauthClient.authorize(access_token_data, request_token));
    const accessHeaders = new Headers();
    for (const key in accessAuthHeader) accessHeaders.append(key, (accessAuthHeader as any)[key]);
    accessHeaders.append('Accept', 'application/x-www-form-urlencoded');

    const accessUrl = new URL(access_token_data.url);
    if (oauth_verifier) accessUrl.searchParams.set('oauth_verifier', oauth_verifier);

    const accessResponse = await fetch(accessUrl.toString(), { headers: accessHeaders });
    if(!accessResponse.ok) throw new Error("Access Token failed");

    const responseData = await accessResponse.text();
    const accessTokenData = new URLSearchParams(responseData);
    const access_token_key = accessTokenData.get('oauth_token');
    const access_token_secret = accessTokenData.get('oauth_token_secret');

    const user_data = { url: `${SCHOOLOGY_API_URL}/users/me?format=json`, method: 'GET' };
    const access_token = { key: access_token_key, secret: access_token_secret };

    const userAuthHeader = oauthClient.toHeader(oauthClient.authorize(user_data as any, access_token as any));
    const userHeaders = new Headers();
    for (const key in userAuthHeader) userHeaders.append(key, (userAuthHeader as any)[key]);
    userHeaders.append('Accept', 'application/json');
    // Some Schoology endpoints redirect (e.g., to a user-specific domain).
    // We must follow redirects by re-signing the new URL with a fresh nonce/timestamp per docs.
    let userResponse = await fetch(user_data.url, { headers: userHeaders, redirect: 'manual' as any });
    if (userResponse.status === 301 || userResponse.status === 302 || userResponse.status === 303) {
      const location = userResponse.headers.get('location');
      if (location) {
        const redirected = { url: location, method: 'GET' } as any;
        const redirectedHeader = oauthClient.toHeader(oauthClient.authorize(redirected, access_token as any));
        const redirectedHeaders = new Headers();
        for (const key in redirectedHeader) redirectedHeaders.append(key, (redirectedHeader as any)[key]);
        redirectedHeaders.append('Accept', 'application/json');
        userResponse = await fetch(location, { headers: redirectedHeaders });
      }
    }
    if(!userResponse.ok) throw new Error("User fetch failed");
    
    const raw = await userResponse.json();
    const u = raw && typeof raw === 'object' && 'user' in raw ? (raw as any).user : raw;
    const userIdValue = (u && (u.id ?? u.uid ?? u.user_id)) as string | number | undefined;
    const userId = userIdValue !== undefined && userIdValue !== null ? String(userIdValue) : '';
    if (userId) {
      await db.collection('users').doc(userId).set({
        accessToken: access_token_key,
        accessSecret: access_token_secret,
        name: u.name_display || u.name || 'Schoology User',
      });
    }

    return { userId };
};
