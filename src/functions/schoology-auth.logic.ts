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

export const requestTokenLogic = async (db, consumerKey, consumerSecret) => {
  const oauthClient = getOauth(consumerKey, consumerSecret);
  const request_data = { url: `${SCHOOLOGY_API_URL}/oauth/request_token`, method: 'GET' };
  
  // Correctly construct Headers object
  const authHeader = oauthClient.toHeader(oauthClient.authorize(request_data));
  const headers = new Headers();
  for (const key in authHeader) {
    headers.append(key, authHeader[key]);
  }

  const response = await fetch(request_data.url, { headers });
  if(!response.ok) throw new Error("Request Token failed");
  const responseData = await response.text();
  const requestTokenData = new URLSearchParams(responseData);
  const token_key = requestTokenData.get('oauth_token');
  const token_secret = requestTokenData.get('oauth_token_secret');
  await db.collection('oauth_tokens').doc(token_key).set({ secret: token_secret, timestamp: Date.now() });
  return `${SCHOOLOGY_APP_URL}/oauth/authorize?oauth_token=${token_key}`;
};

export const callbackLogic = async (db, consumerKey, consumerSecret, oauth_token) => {
    const oauthClient = getOauth(consumerKey, consumerSecret);
    const tokenDoc = await db.collection('oauth_tokens').doc(oauth_token).get();
    if (!tokenDoc.exists) throw new Error('Token not found');
    const request_token_secret = tokenDoc.data().secret;
    
    const access_token_data = { url: `${SCHOOLOGY_API_URL}/oauth/access_token`, method: 'GET' };
    const request_token = { key: oauth_token, secret: request_token_secret };
    
    // Correctly construct Headers object
    const accessAuthHeader = oauthClient.toHeader(oauthClient.authorize(access_token_data, request_token));
    const accessHeaders = new Headers();
    for (const key in accessAuthHeader) {
        accessHeaders.append(key, accessAuthHeader[key]);
    }
    
    const accessResponse = await fetch(access_token_data.url, { headers: accessHeaders });
    if(!accessResponse.ok) throw new Error("Access Token failed");

    const responseData = await accessResponse.text();
    const accessTokenData = new URLSearchParams(responseData);
    const access_token_key = accessTokenData.get('oauth_token');
    const access_token_secret = accessTokenData.get('oauth_token_secret');

    const user_data = { url: `${SCHOOLOGY_API_URL}/users/me`, method: 'GET' };
    const access_token = { key: access_token_key, secret: access_token_secret };

    // Correctly construct Headers object
    const userAuthHeader = oauthClient.toHeader(oauthClient.authorize(user_data, access_token));
    const userHeaders = new Headers();
    for (const key in userAuthHeader) {
        userHeaders.append(key, userAuthHeader[key]);
    }
    
    const userResponse = await fetch(user_data.url, { headers: userHeaders });
    if(!userResponse.ok) throw new Error("User fetch failed");
    
    const user = await userResponse.json();
    await db.collection('users').doc(user.uid).set({
        accessToken: access_token_key,
        accessSecret: access_token_secret,
        name: user.name_display,
    });

    return { userId: user.uid };
};
