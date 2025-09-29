import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(String(userId)).get();
    if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { accessToken, accessSecret } = userDoc.data() as any;
    if (!accessToken || !accessSecret) return NextResponse.json({ error: 'Missing access token' }, { status: 400 });

    const consumerKey = process.env.SCHOOLOGY_CONSUMER_KEY;
    const consumerSecret = process.env.SCHOOLOGY_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) return NextResponse.json({ error: 'Server missing consumer credentials' }, { status: 500 });

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

    // Fetch parent profile (users/me) to read child_uids
    const meReq = { url: `${SCHOOLOGY_API_URL}/users/me?format=json&ts=${Date.now()}`, method: 'GET' } as any;
    const meHeaders = oauthClient.toHeader(oauthClient.authorize(meReq, token));
    const h1 = new Headers();
    for (const k in meHeaders) h1.append(k, (meHeaders as any)[k]);
    h1.append('Accept', 'application/json');
    const meRes = await fetch(meReq.url, { headers: h1 });
    if (!meRes.ok) return NextResponse.json({ error: 'Failed to load parent profile' }, { status: 502 });
    const meRaw = await meRes.json();
    const me = meRaw && typeof meRaw === 'object' && 'user' in meRaw ? (meRaw as any).user : meRaw;
    const childUids: Array<string | number> = Array.isArray(me?.child_uids) ? me.child_uids : [];

    // Fetch each child detail to get display names
    const children = [] as Array<{ id: string; name: string | null }>; 
    for (const uid of childUids) {
      const idStr = String(uid);
      const uReq = { url: `${SCHOOLOGY_API_URL}/users/${encodeURIComponent(idStr)}?format=json&picture_size=sm&ts=${Date.now()}`, method: 'GET' } as any;
      const uHeaders = oauthClient.toHeader(oauthClient.authorize(uReq, token));
      const hu = new Headers();
      for (const k in uHeaders) hu.append(k, (uHeaders as any)[k]);
      hu.append('Accept', 'application/json');
      const uRes = await fetch(uReq.url, { headers: hu });
      if (uRes.ok) {
        const uRaw = await uRes.json();
        const u = uRaw && typeof uRaw === 'object' && 'user' in uRaw ? (uRaw as any).user : uRaw;
        children.push({ id: idStr, name: u?.name_display || u?.name || null });
      } else {
        children.push({ id: idStr, name: null });
      }
    }

    return NextResponse.json({ children });
  } catch (error) {
    console.error('[parent/children] Error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


