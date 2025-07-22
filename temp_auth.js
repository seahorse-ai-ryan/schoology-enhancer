import { Router } from 'express';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { getDb } from './db.js';

const router = Router();

// LAZY INITIALIZATION FOR OAUTH
// This prevents a race condition where `process.env` is not yet populated
// when the module is first imported.
let oauth = null;
const getOauth = () => {
  if (!oauth) {
    oauth = new OAuth({
      consumer: {
        key: process.env.SCHOOLOGY_CONSUMER_KEY,
        secret: process.env.SCHOOLOGY_CONSUMER_SECRET,
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

// Step 1: Get a request token from Schoology
router.get('/schoology', async (req, res) => {
  const request_data = {
    url: `${SCHOOLOGY_API_URL}/oauth/request_token`,
    method: 'GET',
  };

  try {
    const oauthClient = getOauth(); // Get the initialized client
    const response = await fetch(request_data.url, {
      method: request_data.method,
      headers: oauthClient.toHeader(oauthClient.authorize(request_data)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get request token: ${errorText}`);
    }

    const responseData = await response.text();
    const requestToken = new URLSearchParams(responseData);

    const token_key = requestToken.get('oauth_token');
    const token_secret = requestToken.get('oauth_token_secret');

    // Step 1.5: Save the request token and secret to the database
    // We'll use the token as a temporary key to find the secret later.
    const db = getDb();
    await db.run(
      'INSERT INTO oauth_tokens (user_id, token_key, token_secret, is_access_token) VALUES (?, ?, ?, 0) ON CONFLICT(user_id) DO UPDATE SET token_key=excluded.token_key, token_secret=excluded.token_secret, is_access_token=0',
      [token_key, token_key, token_secret]
    );

    console.log('Saved request token to DB associated with temporary key:', token_key);

    // Step 2: Redirect user to Schoology for authorization, with the callback URL as a query param
    const callbackUrl = encodeURIComponent(`${process.env.APP_BASE_URL}/auth/schoology/callback`);
    res.redirect(`${SCHOOLOGY_APP_URL}/oauth/authorize?oauth_token=${token_key}&oauth_callback=${callbackUrl}`);

  } catch (error) {
    console.error('Error in Schoology auth step 1:', error);
    res.status(500).send('Authentication failed.');
  }
});

// Step 3: Handle the callback from Schoology and get the Access Token
router.get('/schoology/callback', async (req, res) => {
  const { oauth_token: request_token_key, oauth_verifier } = req.query;

  if (!request_token_key) {
    return res.status(400).send('Missing oauth_token');
  }

  try {
    const db = getDb();

    // Retrieve the request token secret we stored earlier
    const token_row = await db.get('SELECT token_secret FROM oauth_tokens WHERE token_key = ?', [request_token_key]);
    if (!token_row) {
      throw new Error('Could not find matching request token in database. It may have expired.');
    }
    const request_token_secret = token_row.token_secret;

    const access_token_data = {
      url: `${SCHOOLOGY_API_URL}/oauth/access_token`,
      method: 'GET',
    };

    const token = {
      key: request_token_key,
      secret: request_token_secret,
    };

    // Make a request for the access token
    const access_response = await fetch(access_token_data.url, {
      method: access_token_data.method,
      headers: getOauth().toHeader(getOauth().authorize(access_token_data, token)),
    });

    if (!access_response.ok) {
      const errorText = await access_response.text();
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const responseData = await access_response.text();
    const accessToken = new URLSearchParams(responseData);
    
    const access_token_key = accessToken.get('oauth_token');
    const access_token_secret = accessToken.get('oauth_token_secret');

    // Now we have the permanent access tokens. We should get the user's identity
    // and then store these tokens securely, associated with that user.
    console.log('Received Access Token:', { access_token_key, access_token_secret });
    
    // For now, just redirect back to the client.
    res.redirect(process.env.APP_BASE_URL);

  } catch (error) {
    console.error('Error in Schoology auth step 3:', error);
    res.status(500).send('Authentication failed during callback.');
  }
});


export default router; 