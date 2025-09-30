import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

export async function GET(request: NextRequest) {
  try {
    const parentUid = request.nextUrl.searchParams.get('parent_uid') || '';
    if (!parentUid) return NextResponse.json({ error: 'Missing parent_uid' }, { status: 400 });

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

    async function sgyGet(path: string) {
      const url = `${SCHOOLOGY_API_URL}${path}${path.includes('?') ? '&' : '?'}format=json`;
      const req = { url, method: 'GET' } as any;
      const h = oauthClient.toHeader(oauthClient.authorize(req as any));
      const headers = new Headers();
      for (const k in h) headers.append(k, (h as any)[k]);
      headers.append('Accept', 'application/json');
      return fetch(url, { headers });
    }

    // List users and find parent by school_uid
    let found: any | null = null;
    let start = 0;
    const limit = 200;
    for (let i = 0; i < 20 && !found; i++) {
      const res = await sgyGet(`/users?start=${start}&limit=${limit}`);
      if (!res.ok) return NextResponse.json({ error: 'List users failed', status: res.status }, { status: 502 });
      const j: any = await res.json().catch(() => ({}));
      const arr: any[] = Array.isArray(j?.users?.user) ? j.users.user : Array.isArray(j?.user) ? j.user : [];
      found = arr.find((u: any) => String(u?.school_uid || '').toLowerCase() === parentUid.toLowerCase()) || null;
      if (arr.length < limit) break;
      start += limit;
    }
    if (!found?.id && !found?.uid) return NextResponse.json({ error: 'Parent not found by school_uid', parent_uid: parentUid }, { status: 404 });
    const parentId = String(found.id || found.uid);

    // Direct children endpoint
    let childUids: Array<string> = [];
    const childRes = await sgyGet(`/users/${encodeURIComponent(parentId)}/children`);
    let childRaw: any = null;
    if (childRes.ok) {
      childRaw = await childRes.json().catch(() => ({}));
      const arr: any[] = Array.isArray(childRaw?.children?.child) ? childRaw.children.child : Array.isArray(childRaw?.child) ? childRaw.child : [];
      childUids = arr.map((it: any) => String(it?.id ?? it?.uid ?? it)).filter(Boolean);
    }
    // Fallback: parent profile
    if (childUids.length === 0) {
      const prof = await sgyGet(`/users/${encodeURIComponent(parentId)}`);
      if (!prof.ok) return NextResponse.json({ error: 'Parent profile fetch failed', status: prof.status }, { status: 502 });
      const raw = await prof.json().catch(() => ({}));
      const u = raw && typeof raw === 'object' && 'user' in raw ? (raw as any).user : raw;
      const cu = (u as any)?.child_uids;
      if (Array.isArray(cu)) {
        childUids = cu.map((x) => String(x));
      } else if (cu && typeof cu === 'object') {
        const list = (cu as any).uid;
        if (Array.isArray(list)) childUids = list.map((x: any) => String(x));
        else if (list !== undefined && list !== null) childUids = [String(list)];
      } else if (typeof cu === 'string') {
        childUids = cu.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (childUids.length === 0 && (u as any)?.children) {
        const ch = (u as any).children;
        const list = Array.isArray(ch?.child) ? ch.child : (ch?.child ? [ch.child] : []);
        childUids = list.map((it: any) => String(it?.id ?? it?.uid ?? it)).filter(Boolean);
      }
    }

    const meta = {
      child_endpoint_keys: childRaw ? Object.keys(childRaw || {}) : null,
      profile_keys: undefined as any,
    };
    try {
      const prof2 = await sgyGet(`/users/${encodeURIComponent(parentId)}`);
      if (prof2.ok) {
        const pr = await prof2.json().catch(() => ({}));
        const uu = pr && typeof pr === 'object' && 'user' in pr ? (pr as any).user : pr;
        meta.profile_keys = uu ? Object.keys(uu) : null;
      }
    } catch {}
    return NextResponse.json({ parent_uid: parentUid, parent_id: parentId, child_uids: childUids, source: 'admin:live', meta });
  } catch (e) {
    console.error('[admin/parent/children] Error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


