import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

type Assoc = { student_school_uid: string; parent_school_uid: string };

export async function POST(request: NextRequest) {
  try {
    // Dev backdoor: allow x-seed-key like other admin endpoints
    const headerSeedKey = request.headers.get('x-seed-key') || '';
    const allowedSeedKey = process.env.ADMIN_SEED_KEY || 'dev-seed';
    const cookieUserId = request.cookies.get('schoology_user_id')?.value || '';

    if (headerSeedKey !== allowedSeedKey) {
      const { getFirestore } = await import('firebase-admin/firestore');
      const { initializeApp, getApps } = await import('firebase-admin/app');
      if (!getApps().length) {
        initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
      }
      const db = getFirestore();
      if (!cookieUserId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      const roleDoc = await db.collection('app_roles').doc(cookieUserId).get();
      const roles: string[] = (roleDoc.exists && Array.isArray((roleDoc.data() as any)?.roles)) ? (roleDoc.data() as any).roles : [];
      if (!roles.includes('admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = process.env.SCHOOLOGY_ADMIN_KEY;
    const apiSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'Missing admin API credentials' }, { status: 500 });

    const bodyJson = await request.json().catch(() => ({} as any));
    const pairs: Assoc[] = Array.isArray(bodyJson?.pairs) ? bodyJson.pairs : [];

    // Default associations if none provided
    const defaults: Assoc[] = [
      { student_school_uid: 'carter_mock_20250929', parent_school_uid: 'christina_mock_20250929' },
      { student_school_uid: 'tazio_mock_20250929',  parent_school_uid: 'christina_mock_20250929' },
      { student_school_uid: 'livio_mock_20250929',  parent_school_uid: 'christina_mock_20250929' },
      { student_school_uid: 'carter_mock_20250929', parent_school_uid: 'ryan_hickman_20250929' },
      { student_school_uid: 'tazio_mock_20250929',  parent_school_uid: 'ryan_hickman_20250929' },
      { student_school_uid: 'livio_mock_20250929',  parent_school_uid: 'ryan_hickman_20250929' },
    ];
    const toAssociate = pairs.length ? pairs : defaults;

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    const oauthClient = new OAuth({
      consumer: { key: apiKey, secret: apiSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    async function sgyPostJson(path: string, body: any) {
      const url = `${SCHOOLOGY_API_URL}${path}${path.includes('?') ? '&' : '?'}format=json`;
      const req = { url, method: 'POST' } as any; // sign without body params for JSON
      const h = oauthClient.toHeader(oauthClient.authorize(req));
      const headers = new Headers();
      for (const k in h) headers.append(k, (h as any)[k]);
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      return res;
    }

    const payload = { associations: { association: toAssociate } };
    const res = await sgyPostJson('/users/import/associations/parents', payload);
    const text = await res.text().catch(() => '');
    let parsed: any = null; try { parsed = JSON.parse(text); } catch {}
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, body: parsed || text }, { status: 502 });
    }

    return NextResponse.json({ ok: true, status: res.status, result: parsed || text, count: toAssociate.length });
  } catch (e) {
    console.error('[admin/associations/parents] Error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




