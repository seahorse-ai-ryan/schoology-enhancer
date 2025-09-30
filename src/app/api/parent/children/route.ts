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
    
    // If user doesn't have OAuth tokens (e.g., Mock users created via admin API),
    // use admin credentials to fetch their data
    const useAdminCredentials = !accessToken || !accessSecret;
    
    let consumerKey: string;
    let consumerSecret: string;
    
    if (useAdminCredentials) {
      consumerKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
      consumerSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';
      if (!consumerKey || !consumerSecret) {
        return NextResponse.json({ error: 'Server missing admin credentials' }, { status: 500 });
      }
      console.log('[parent/children] Using admin credentials for user without OAuth tokens:', userId);
    } else {
      consumerKey = process.env.SCHOOLOGY_CONSUMER_KEY || '';
      consumerSecret = process.env.SCHOOLOGY_CONSUMER_SECRET || '';
      if (!consumerKey || !consumerSecret) {
        return NextResponse.json({ error: 'Server missing consumer credentials' }, { status: 500 });
      }
    }

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    let oauthClient = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });
    // For admin credentials, we don't pass a token (2-legged OAuth)
    let token: any = useAdminCredentials ? undefined : { key: accessToken as string, secret: accessSecret as string };

    // Fetch parent profile - use /users/{id} for admin credentials, /users/me for user OAuth
    const meEndpoint = useAdminCredentials ? `/users/${userId}` : '/users/me';
    const meUrl = `${SCHOOLOGY_API_URL}${meEndpoint}`;
    const meReq = { url: meUrl, method: 'GET' } as any;
    const meHeaders = oauthClient.toHeader(oauthClient.authorize(meReq, token));
    const h1 = new Headers();
    for (const k in meHeaders) h1.append(k, (meHeaders as any)[k]);
    h1.append('Accept', 'application/json');
    console.log('[parent/children] Fetching parent profile:', { url: meUrl, userId, useAdmin: useAdminCredentials });
    let meRes = await fetch(meUrl, { headers: h1 });
    
    // If user OAuth tokens fail with 401 (common nonce collision), retry with admin credentials
    if (!meRes.ok && meRes.status === 401 && !useAdminCredentials) {
      console.log('[parent/children] User token failed, retrying with admin credentials');
      const adminKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
      const adminSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';
      if (adminKey && adminSecret) {
        const adminOauth = new OAuth({
          consumer: { key: adminKey, secret: adminSecret },
          signature_method: 'HMAC-SHA1',
          hash_function(base_string: string, key: string) {
            return crypto.createHmac('sha1', key).update(base_string).digest('base64');
          },
        });
        const adminMeUrl = `${SCHOOLOGY_API_URL}/users/${userId}`;
        const adminMeReq = { url: adminMeUrl, method: 'GET' } as any;
        const adminMeHeaders = adminOauth.toHeader(adminOauth.authorize(adminMeReq, undefined));
        const adminH1 = new Headers();
        for (const k in adminMeHeaders) adminH1.append(k, (adminMeHeaders as any)[k]);
        adminH1.append('Accept', 'application/json');
        meRes = await fetch(adminMeUrl, { headers: adminH1 });
        // Update consumerKey and token for child fetching
        consumerKey = adminKey;
        consumerSecret = adminSecret;
        oauthClient = adminOauth;
        token = undefined;
      }
    }
    
    if (!meRes.ok) {
      const errText = await meRes.text().catch(() => 'unable to read');
      console.error('[parent/children] Failed to fetch parent profile:', { status: meRes.status, error: errText.slice(0, 500) });
      return NextResponse.json({ error: 'Failed to load parent profile', details: { status: meRes.status, message: errText.slice(0, 200) } }, { status: 502 });
    }
    const meRaw = await meRes.json();
    const me = meRaw && typeof meRaw === 'object' && 'user' in meRaw ? (meRaw as any).user : meRaw;
    // Robust extraction of child IDs across response shapes
    let childUids: Array<string | number> = [];
    const cu = (me as any)?.child_uids;
    if (Array.isArray(cu)) {
      childUids = cu;
    } else if (typeof cu === 'string' && cu.length > 0) {
      // Handle comma-separated string (common format from Schoology API)
      childUids = cu.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (cu && typeof cu === 'object') {
      const list = (cu as any).uid;
      if (Array.isArray(list)) childUids = list;
      else if (list !== undefined && list !== null) childUids = [list];
    }
    // Fallback: some responses may include `children.child`
    if (childUids.length === 0 && (me as any)?.children) {
      const ch = (me as any).children;
      const list = Array.isArray(ch?.child) ? ch.child : (ch?.child ? [ch.child] : []);
      childUids = list.map((it: any) => String(it?.id ?? it?.uid ?? it).trim()).filter(Boolean);
    }

    const debugEnabled = request.nextUrl.searchParams.get('debug') === '1';
    const debug: any = debugEnabled ? { me: { url: meReq.url, headers: Object.fromEntries(h1) } } : undefined;

    // If empty, fallback via admin: reverse-lookup students whose parents include this parent
    if (childUids.length === 0) {
      try {
        const adminKey = process.env.SCHOOLOGY_ADMIN_KEY;
        const adminSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
        if (adminKey && adminSecret) {
          const OAuth2 = (await import('oauth-1.0a')).default;
          const crypto2 = await import('crypto');
          const adminOauth = new OAuth2({
            consumer: { key: adminKey, secret: adminSecret },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string: string, key: string) {
              return crypto2.createHmac('sha1', key).update(base_string).digest('base64');
            },
          });
          async function aget(path: string) {
            const url = `${SCHOOLOGY_API_URL}${path}${path.includes('?') ? '&' : '?'}format=json`;
            const req = { url, method: 'GET' } as any;
            const h = adminOauth.toHeader(adminOauth.authorize(req));
            const hh = new Headers();
            for (const k in h) hh.append(k, (h as any)[k]);
            hh.append('Accept', 'application/json');
            return fetch(url, { headers: hh });
          }
          // List first 1000 users; filter students that list this parent
          let start = 0; const limit = 200; const acc: string[] = [];
          for (let i = 0; i < 10; i++) {
            const r = await aget(`/users?start=${start}&limit=${limit}`);
            if (!r.ok) break;
            const j: any = await r.json().catch(() => ({}));
            const arr: any[] = Array.isArray(j?.users?.user) ? j.users.user : Array.isArray(j?.user) ? j.user : [];
            for (const it of arr) {
              const sid = String(it?.id || it?.uid || '');
              if (!sid) continue;
              const parentsUrl = `/users/${encodeURIComponent(sid)}/parents`;
              const pr = await aget(parentsUrl);
              if (pr.ok) {
                const pj: any = await pr.json().catch(() => ({}));
                const plist: any[] = Array.isArray(pj?.parents?.parent) ? pj.parents.parent : Array.isArray(pj?.parent) ? pj.parent : [];
                const match = plist.some((p: any) => String(p?.id || p?.uid || '') === String(userId));
                if (match) acc.push(sid);
                if (debugEnabled && match) {
                  if (!debug?.matches) debug.matches = [];
                  debug.matches.push({ student_id: sid, parents_count: plist.length });
                }
              }
            }
            if (arr.length < limit) break;
            start += limit;
          }
          if (acc.length) childUids = acc;
        }
      } catch {}
    }

    // Prepare optional admin client for fallback name resolution
    let adminOauth: any = null;
    const adminKey = process.env.SCHOOLOGY_ADMIN_KEY;
    const adminSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
    if (adminKey && adminSecret) {
      const OAuth2 = (await import('oauth-1.0a')).default;
      const crypto2 = await import('crypto');
      adminOauth = new OAuth2({
        consumer: { key: adminKey, secret: adminSecret },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string: string, key: string) {
          return crypto2.createHmac('sha1', key).update(base_string).digest('base64');
        },
      });
    }

    // Fetch each child detail to get display names
    const children = [] as Array<{ id: string; name: string | null }>; 
    for (const uid of childUids) {
      const idStr = String(uid);
      const uReq = { url: `${SCHOOLOGY_API_URL}/users/${encodeURIComponent(idStr)}?format=json&picture_size=sm&ts=${Date.now()}`, method: 'GET' } as any;
      // Use admin credentials if parent doesn't have OAuth tokens
      const uHeaders = oauthClient.toHeader(oauthClient.authorize(uReq, token));
      const hu = new Headers();
      for (const k in uHeaders) hu.append(k, (uHeaders as any)[k]);
      hu.append('Accept', 'application/json');
      console.log('[parent/children] Fetching child detail:', { childId: idStr, useAdmin: useAdminCredentials });
      const uRes = await fetch(uReq.url, { headers: hu });
      if (!uRes.ok) {
        const errText = await uRes.text().catch(() => 'unable to read');
        console.error('[parent/children] Child detail fetch failed:', { childId: idStr, status: uRes.status, error: errText.slice(0, 500) });
        return NextResponse.json({ error: 'Child detail fetch failed', childId: idStr, status: uRes.status, details: errText.slice(0, 200) }, { status: 502 });
      }
      const uRaw = await uRes.json();
      const u = uRaw && typeof uRaw === 'object' && 'user' in uRaw ? (uRaw as any).user : uRaw;
      children.push({ id: idStr, name: u?.name_display || u?.name || null });
    }

    return NextResponse.json(debugEnabled ? { children, debug } : { children });
  } catch (error) {
    console.error('[parent/children] Error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


