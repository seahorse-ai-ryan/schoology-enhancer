import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

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
    const ts = Date.now();
    const requestData = { url: `${SCHOOLOGY_API_URL}/users/me?format=json&picture_size=sm&ts=${ts}`, method: 'GET' } as any;
    const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData, token));
    const headers = new Headers();
    for (const k in authHeader) headers.append(k, (authHeader as any)[k]);
    headers.append('Accept', 'application/json');
    headers.append('Cache-Control', 'no-cache');

    let res = await fetch(requestData.url, { headers, redirect: 'manual' as any });
    if (res.status === 301 || res.status === 302 || res.status === 303) {
      const location = res.headers.get('location');
      if (location) {
        const redirected = { url: location, method: 'GET' } as any;
        const redirectHeader = oauthClient.toHeader(oauthClient.authorize(redirected, token));
        const redirectHeaders = new Headers();
        for (const k in redirectHeader) redirectHeaders.append(k, (redirectHeader as any)[k]);
        redirectHeaders.append('Accept', 'application/json');
        redirectHeaders.append('Cache-Control', 'no-cache');
        res = await fetch(location, { headers: redirectHeaders });
      }
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'Live request failed', status: res.status }, { status: 502 });
    }
    const raw = await res.json();
    const me = raw && typeof raw === 'object' && 'user' in raw ? (raw as any).user : raw;

    // Fetch detailed user record by id to enrich fields (phone, bio, position can appear here)
    const userIdStr = String(me.id ?? me.uid ?? '');
    let detail: any = {};
    if (userIdStr) {
      const detailReq = { url: `${SCHOOLOGY_API_URL}/users/${userIdStr}?format=json&picture_size=sm&ts=${Date.now()}` , method: 'GET' } as any;
      const detailHeader = oauthClient.toHeader(oauthClient.authorize(detailReq, token));
      const dHeaders = new Headers();
      for (const k in detailHeader) dHeaders.append(k, (detailHeader as any)[k]);
      dHeaders.append('Accept', 'application/json');
      dHeaders.append('Cache-Control', 'no-cache');
      let dRes = await fetch(detailReq.url, { headers: dHeaders, redirect: 'manual' as any });
      if (dRes.status === 301 || dRes.status === 302 || dRes.status === 303) {
        const loc = dRes.headers.get('location');
        if (loc) {
          const red = { url: loc, method: 'GET' } as any;
          const redHeader = oauthClient.toHeader(oauthClient.authorize(red, token));
          const redHeaders = new Headers();
          for (const k in redHeader) redHeaders.append(k, (redHeader as any)[k]);
          redHeaders.append('Accept', 'application/json');
          redHeaders.append('Cache-Control', 'no-cache');
          dRes = await fetch(loc, { headers: redHeaders });
        }
      }
      if (dRes.ok) {
        const dRaw = await dRes.json();
        detail = dRaw && typeof dRaw === 'object' && 'user' in dRaw ? (dRaw as any).user : dRaw;
      }
    }

    const merged: any = { ...me, ...detail };
    const id = String(merged.id ?? merged.uid ?? '');
    const name = merged.name_display || merged.name;
    const first = merged.name_first ?? null;
    const last = merged.name_last ?? null;
    const username = merged.username ?? null;
    const primary_email = merged.primary_email ?? merged.mail ?? merged.email ?? null;
    const phone = merged.phone ?? merged.primary_phone ?? merged.mobile_phone ?? merged.home_phone ?? null;
    const position = merged.position ?? null;
    const bio = merged.bio ?? null;
    const picture_url = merged.picture_url ?? null;
    const school_id = merged.school_nid ?? merged.school_id ?? null;
    const role = merged.role_id ?? merged.role ?? null;

    return NextResponse.json({
      id,
      name,
      first,
      last,
      username,
      primary_email,
      phone,
      position,
      bio,
      picture_url,
      school_id,
      role,
      source: 'live',
      fields: Array.isArray(Object.keys(merged)) ? Object.keys(merged) : [],
    });
  } catch (error) {
    console.error('[schoology.me] Error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


