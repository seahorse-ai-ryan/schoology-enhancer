import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock login endpoint for testing with Mock family users (Christina, Carter, Tazio, Livio).
 * These are real Schoology users created via admin API but without OAuth tokens.
 * 
 * Usage: GET /api/mock/login?user_id=140767548
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('user_id');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id parameter' }, { status: 400 });
  }

  // Create a simple Firestore entry for this user if it doesn't exist
  const { getFirestore } = await import('firebase-admin/firestore');
  const { initializeApp, getApps } = await import('firebase-admin/app');
  if (!getApps().length) {
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
  }
  const db = getFirestore();
  
  // Check if user exists in Schoology via admin API
  const OAuth = (await import('oauth-1.0a')).default;
  const crypto = await import('crypto');
  const adminKey = process.env.SCHOOLOGY_ADMIN_KEY;
  const adminSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
  
  if (!adminKey || !adminSecret) {
    return NextResponse.json({ error: 'Server missing admin credentials' }, { status: 500 });
  }
  
  const oauthClient = new OAuth({
    consumer: { key: adminKey, secret: adminSecret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string: string, key: string) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });
  
  const userReq = { url: `https://api.schoology.com/v1/users/${userId}?format=json`, method: 'GET' } as any;
  const headers = oauthClient.toHeader(oauthClient.authorize(userReq, undefined));
  const h = new Headers();
  for (const k in headers) h.append(k, (headers as any)[k]);
  h.append('Accept', 'application/json');
  
  const userRes = await fetch(userReq.url, { headers: h });
  if (!userRes.ok) {
    return NextResponse.json({ error: 'User not found in Schoology' }, { status: 404 });
  }
  
  const userData = await userRes.json();
  const user = userData && typeof userData === 'object' && 'user' in userData ? (userData as any).user : userData;
  const userName = user?.name_display || user?.name || 'Mock User';
  
  // Store minimal user data in Firestore (without OAuth tokens)
  await db.collection('users').doc(userId).set({
    name: userName,
    schoologyId: userId,
    isMockUser: true,
    lastLogin: Date.now()
  }, { merge: true });
  
  // Set cookie and redirect to dashboard
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  response.cookies.set('schoology_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  return response;
}


