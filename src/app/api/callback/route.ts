import { NextRequest, NextResponse } from 'next/server';
import { callbackLogic } from '@/functions/schoology-auth.logic';

async function handleCallback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');

    if (!oauthToken) {
      return NextResponse.json({ error: 'Missing OAuth parameters' }, { status: 400 });
    }

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');

    let db: ReturnType<typeof getFirestore> | null = null;

    try {
      if (!getApps().length) {
        initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
        });
      }

      db = getFirestore();
    } catch (adminError) {
      console.warn('[callback] Firestore admin unavailable, using in-memory token store.', adminError);
    }

    const consumerKey = process.env.SCHOOLOGY_CONSUMER_KEY;
    const consumerSecret = process.env.SCHOOLOGY_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error('Missing Schoology consumer credentials');
    }

    console.log('[callback] Exchanging request token for access token.');
    const userData = await callbackLogic(db, consumerKey, consumerSecret, oauthToken, oauthVerifier);
    console.log('[callback] User data received.', { id: userData.userId, name: userData.name });

    // Build absolute redirect honoring proxy headers (ngrok) to avoid localhost
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedHost = request.headers.get('x-forwarded-host');
    const urlFromRequest = new URL(request.url);
    const proto = forwardedProto || urlFromRequest.protocol.replace(':', '');
    const host = forwardedHost || request.headers.get('host') || urlFromRequest.host;
    const origin = `${proto}://${host}`;
    const response = NextResponse.redirect(`${origin}/dashboard`);
    response.cookies.set('schoology_user_id', userData.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[callback] OAuth callback failed.', error);
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleCallback(request);
}

export async function POST(request: NextRequest) {
  const body = await request.formData();
  const url = new URL(request.url);

  for (const [key, value] of body.entries()) {
    url.searchParams.set(key, String(value));
  }

  const mutatedRequest = new NextRequest(url, request);
  return handleCallback(mutatedRequest);
}

