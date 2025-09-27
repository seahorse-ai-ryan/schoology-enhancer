import { NextRequest, NextResponse } from 'next/server';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const consumerKey = process.env.SCHOOLOGY_CONSUMER_KEY;
    const consumerSecret = process.env.SCHOOLOGY_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) {
      return NextResponse.json({ error: 'Server missing consumer credentials' }, { status: 500 });
    }

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const adminDb = getFirestore();

    const docSnap = await adminDb.collection('users').doc(userId).get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { accessToken, accessSecret } = docSnap.data() as any;
    if (!accessToken || !accessSecret) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    const oauthClient = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    const token = { key: accessToken as string, secret: accessSecret as string };
    const requestData = { url: `${SCHOOLOGY_API_URL}/users/me?format=json`, method: 'GET' } as any;
    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData, token));
    const headers = new Headers();
    for (const k in authHeader) headers.append(k, (authHeader as any)[k]);
    headers.append('Accept', 'application/json');

    let res = await fetch(requestData.url, { headers, redirect: 'manual' as any });
    if (res.status === 301 || res.status === 302 || res.status === 303) {
      const location = res.headers.get('location');
      if (location) {
        const redirected = { url: location, method: 'GET' } as any;
        const redirectHeader = oauthClient.toHeader(oauthClient.authorize(redirected, token));
        const redirectHeaders = new Headers();
        for (const k in redirectHeader) redirectHeaders.append(k, (redirectHeader as any)[k]);
        redirectHeaders.append('Accept', 'application/json');
        res = await fetch(location, { headers: redirectHeaders });
      }
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'Live request failed', status: res.status }, { status: 502 });
    }
    const raw = await res.json();
    const u = raw && typeof raw === 'object' && 'user' in raw ? (raw as any).user : raw;
    return NextResponse.json({
      id: String(u.id ?? u.uid ?? ''),
      name: u.name_display || u.name,
      source: 'live',
    });
  } catch (error) {
    console.error('[schoology.me] Error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


