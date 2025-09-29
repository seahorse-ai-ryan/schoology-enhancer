import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

export async function GET(request: NextRequest) {
  try {
    const parentId = request.cookies.get('schoology_user_id')?.value;
    if (!parentId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const db = getFirestore();

    const parentDoc = await db.collection('parents').doc(String(parentId)).get();
    const activeChildId = (parentDoc.exists ? (parentDoc.data() as any)?.activeChildId : null) || null;
    if (!activeChildId) return NextResponse.json({ error: 'No active child selected' }, { status: 400 });
    // When children are listed from Schoology, activeChildId is already the Schoology user id
    let schoologyUserId: string | null = String(activeChildId);

    const apiKey = process.env.SCHOOLOGY_ADMIN_KEY;
    const apiSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'Missing admin API credentials' }, { status: 500 });

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    const oauthClient = new OAuth({
      consumer: { key: apiKey, secret: apiSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    if (!schoologyUserId) return NextResponse.json({ error: 'Missing schoologyUserId for child', activeChildId }, { status: 400 });

    const reqData = { url: `${SCHOOLOGY_API_URL}/users/${encodeURIComponent(String(schoologyUserId))}?format=json&picture_size=sm&ts=${Date.now()}`, method: 'GET' } as any;
    const headers = new Headers();
    const authHeader = oauthClient.toHeader(oauthClient.authorize(reqData as any));
    for (const k in authHeader) headers.append(k, (authHeader as any)[k]);
    headers.append('Accept', 'application/json');
    headers.append('Cache-Control', 'no-cache');

    let res = await fetch(reqData.url, { headers, redirect: 'manual' as any });
    if (res.status === 301 || res.status === 302 || res.status === 303) {
      const location = res.headers.get('location');
      if (location) {
        const red = { url: location, method: 'GET' } as any;
        const redHeader = oauthClient.toHeader(oauthClient.authorize(red as any));
        const redHeaders = new Headers();
        for (const k in redHeader) redHeaders.append(k, (redHeader as any)[k]);
        redHeaders.append('Accept', 'application/json');
        redHeaders.append('Cache-Control', 'no-cache');
        res = await fetch(location, { headers: redHeaders });
      }
    }
    if (!res.ok) return NextResponse.json({ error: 'Child fetch failed', status: res.status }, { status: 502 });
    const raw = await res.json();
    const u = raw && typeof raw === 'object' && 'user' in raw ? (raw as any).user : raw;
    return NextResponse.json({
      id: String(u.id ?? u.uid ?? ''),
      name: u.name_display || u.name,
      first: u.name_first ?? null,
      last: u.name_last ?? null,
      username: u.username ?? null,
      primary_email: u.primary_email ?? u.email ?? null,
      phone: u.phone ?? u.primary_phone ?? u.mobile_phone ?? u.home_phone ?? null,
      picture_url: u.picture_url ?? null,
      school_id: u.school_nid ?? u.school_id ?? null,
      role: u.role_id ?? u.role ?? null,
      source: 'admin:live',
      fields: Array.isArray(Object.keys(u)) ? Object.keys(u) : [],
    });
  } catch (e) {
    console.error('[schoology.child] Error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


