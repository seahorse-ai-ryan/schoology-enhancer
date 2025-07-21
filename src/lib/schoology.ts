
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

const getOauthClient = () => {
  const clientId = process.env.SCHOOLOGY_CLIENT_ID;
  const clientSecret = process.env.SCHOOLOGY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Schoology Client ID or Secret is not configured in environment variables.');
  }

  return new OAuth({
    consumer: {
      key: clientId,
      secret: clientSecret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });
}


export async function getRequestToken() {
  const oauth = getOauthClient();
  const requestData = {
    url: `${SCHOOLOGY_API_URL}/oauth/request_token`,
    method: 'GET',
    data: {
        // Schoology requires oauth_callback to be part of the signed request
        oauth_callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/schoology`,
    }
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
