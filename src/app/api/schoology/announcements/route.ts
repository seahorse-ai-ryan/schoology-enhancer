import { NextRequest, NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export const runtime = 'nodejs';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const SCHOOL_GROUP_ID = '8068284260'; // Palo Alto High School - All Students

async function makeSchoologyRequest(url: string, targetUserId: string) {
  const consumerKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
  const consumerSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';
  if (!consumerKey || !consumerSecret) throw new Error('Admin credentials not configured.');

  const oauth = new OAuth({
    consumer: { key: consumerKey, secret: consumerSecret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });

  const requestData = { url, method: 'GET' };
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('X-Schoology-Run-As', String(targetUserId));
  const authHeader = oauth.toHeader(oauth.authorize(requestData));
  for (const key in authHeader) headers.append(key, (authHeader as any)[key]);
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Schoology API request failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch announcements from school-wide group
 * GET /api/schoology/announcements?limit=12
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '12');

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    
    const db = getFirestore();
    const parentDoc = await db.collection('parents').doc(String(userId)).get();
    const activeChildId = (parentDoc.exists ? parentDoc.data()?.activeChildId : null) || null;
    const targetUserId = activeChildId || userId;

    // Check cache first
    const cacheKey = `announcements_${limit}`;
    const cacheDoc = await db.collection('cache_announcements').doc(cacheKey).get();
    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const cacheAge = Date.now() - (cacheData?.cachedAt || 0);
      
      if (cacheAge < CACHE_TTL_MS) {
        console.log(`[announcements] Returning cached data (age: ${Math.round(cacheAge / 1000)}s)`);
        return NextResponse.json({
          announcements: cacheData?.announcements || [],
          source: 'cached',
          cachedAt: cacheData?.cachedAt
        });
      }
    }

    // Fetch from Schoology group updates
    const updatesResponse = await makeSchoologyRequest(
      `${SCHOOLOGY_API_URL}/groups/${SCHOOL_GROUP_ID}/updates?limit=${limit}`,
      targetUserId
    );

    const updates = updatesResponse.update || [];
    
    const announcements = updates.map((u: any) => ({
      id: u.id,
      title: u.body.match(/<h[1-4]>(.*?)<\/h[1-4]>/)?.[1] || 'Announcement',
      body: u.body,
      author: u.user_name || 'School Administration',
      created: u.created || new Date().toISOString(),
      isLong: u.body.replace(/<[^>]+>/g, '').length > 300,
    }));

    // Cache the result
    try {
      await db.collection('cache_announcements').doc(cacheKey).set({
        announcements,
        cachedAt: Date.now(),
      });
      console.log(`[announcements] Cached ${announcements.length} announcements`);
    } catch (cacheError) {
      console.error('[announcements] Failed to cache:', cacheError);
    }

    return NextResponse.json({
      announcements,
      source: 'live',
      cachedAt: Date.now()
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch announcements', details: message }, { status: 500 });
  }
}

