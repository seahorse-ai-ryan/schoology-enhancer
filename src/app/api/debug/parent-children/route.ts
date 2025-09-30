import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Debug endpoint to test parent/children fetching using admin credentials directly.
 * This bypasses OAuth token lookup and uses admin API keys exclusively.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const adminKey = process.env.SCHOOLOGY_ADMIN_KEY;
    const adminSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
    
    if (!adminKey || !adminSecret) {
      return NextResponse.json({ error: 'Missing admin credentials' }, { status: 500 });
    }

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    const oauthClient = new OAuth({
      consumer: { key: adminKey, secret: adminSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    // Fetch parent profile using admin credentials
    const userUrl = `https://api.schoology.com/v1/users/${userId}`;
    const userReq = { url: userUrl, method: 'GET' } as any;
    const userHeaders = oauthClient.toHeader(oauthClient.authorize(userReq, undefined));
    const h = new Headers();
    for (const k in userHeaders) h.append(k, (userHeaders as any)[k]);
    h.append('Accept', 'application/json');
    
    const userRes = await fetch(userUrl, { headers: h });
    if (!userRes.ok) {
      const errText = await userRes.text();
      return NextResponse.json({ 
        error: 'Failed to fetch user', 
        status: userRes.status,
        details: errText.slice(0, 500)
      }, { status: 502 });
    }
    
    const userData = await userRes.json();
    const user = userData && typeof userData === 'object' && 'user' in userData ? (userData as any).user : userData;
    
    // Extract child UIDs
    let childUids: string[] = [];
    const cu = user?.child_uids;
    if (Array.isArray(cu)) {
      childUids = cu.map((id: any) => String(id));
    } else if (typeof cu === 'string' && cu.length > 0) {
      // Handle comma-separated string
      childUids = cu.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (cu && typeof cu === 'object') {
      const list = (cu as any).uid;
      if (Array.isArray(list)) childUids = list.map((id: any) => String(id));
      else if (list !== undefined && list !== null) childUids = [String(list)];
    }
    
    // Fetch each child's details
    const children = [];
    for (const childId of childUids) {
      const childUrl = `https://api.schoology.com/v1/users/${childId}`;
      const childReq = { url: childUrl, method: 'GET' } as any;
      const childHeaders = oauthClient.toHeader(oauthClient.authorize(childReq, undefined));
      const ch = new Headers();
      for (const k in childHeaders) ch.append(k, (childHeaders as any)[k]);
      ch.append('Accept', 'application/json');
      
      const childRes = await fetch(childUrl, { headers: ch });
      if (childRes.ok) {
        const childData = await childRes.json();
        const child = childData && typeof childData === 'object' && 'user' in childData ? (childData as any).user : childData;
        children.push({
          id: childId,
          name: child?.name_display || child?.name || null,
        });
      }
    }
    
    return NextResponse.json({ 
      userId,
      childUids,
      children,
      debug: {
        user_keys: Object.keys(user || {}),
        child_uids_raw: user?.child_uids,
      }
    });
  } catch (error) {
    console.error('[debug/parent-children] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
