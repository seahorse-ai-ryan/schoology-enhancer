import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

// Lazy initialization for the OAuth client to prevent issues with env vars
let oauth;
const getOauth = () => {
  if (!oauth) {
    oauth = new OAuth({
      consumer: {
        key: process.env.SCHOOLOGY_CONSUMER_KEY || '',
        secret: process.env.SCHOOLOGY_CONSUMER_SECRET || '',
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

export const requestToken = onRequest({ secrets: ["SCHOOLOGY_CONSUMER_KEY", "SCHOOLOGY_CONSUMER_SECRET"] }, async (request, response) => {
  logger.info('Request for Schoology request token received');

  const request_data = {
    url: `${SCHOOLOGY_API_URL}/oauth/request_token`,
    method: 'GET',
  };

  const oauthClient = getOauth();

  try {
    const fetchResponse = await fetch(request_data.url, {
      method: request_data.method,
      headers: oauthClient.toHeader(oauthClient.authorize(request_data)),
    });

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      throw new Error(`Failed to get request token: ${errorText}`);
    }

    const responseData = await fetchResponse.text();
    const requestToken = new URLSearchParams(responseData);
    
    const token_key = requestToken.get('oauth_token');
    const token_secret = requestToken.get('oauth_token_secret');

    // Temporarily store the request token secret
    await db.collection('oauth_tokens').doc(token_key).set({
      secret: token_secret,
      timestamp: Date.now(),
    });

    // Redirect user to Schoology for authorization
    const redirectUrl = `${SCHOOLOGY_APP_URL}/oauth/authorize?oauth_token=${token_key}`;
    response.redirect(redirectUrl);

  } catch (error) {
    logger.error('Error in Schoology auth step 1:', error);
    response.status(500).send('Authentication failed.');
  }
});

export const callback = onRequest(async (request, response) => {
  logger.info('Schoology callback received');
  // Logic to exchange request token for access token will go here
  response.send('Function not implemented');
});
