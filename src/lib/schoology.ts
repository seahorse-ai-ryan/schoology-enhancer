import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

const oauth = new OAuth({
  consumer: {
    key: process.env.SCHOOLOGY_CLIENT_ID!,
    secret: process.env.SCHOOLOGY_CLIENT_SECRET!,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

export async function getRequestToken() {
  const requestData = {
    url: `${SCHOOLOGY_API_URL}/oauth/request_token`,
    method: 'GET',
  };

  const response = await fetch(requestData.url, {
    method: requestData.method,
    headers: oauth.toHeader(oauth.authorize(requestData)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get request token: ${response.status} ${text}`);
  }

  const responseData = await response.text();
  const params = new URLSearchParams(responseData);

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
    // Note: The verifier isn't used in Schoology's flow but might be needed for other OAuth 1.0a providers
    // We include it here for completeness but Schoology ignores it. The key is using the authorized request token.
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
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
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
