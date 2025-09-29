import { NextRequest, NextResponse } from 'next/server';
import { requestTokenLogic } from '@/functions/schoology-auth.logic';

export async function GET(request: NextRequest) {
  try {
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
      console.warn('[requestToken] Firestore admin unavailable, falling back to in-memory token store.', adminError);
    }

    const consumerKey = process.env.SCHOOLOGY_CONSUMER_KEY;
    const consumerSecret = process.env.SCHOOLOGY_CONSUMER_SECRET;
    const callbackUrl = process.env.SCHOOLOGY_CALLBACK_URL;

    if (!callbackUrl) {
      return NextResponse.json({ error: 'Missing SCHOOLOGY_CALLBACK_URL' }, { status: 500 });
    }

    const hasPlaceholderCreds =
      !consumerKey ||
      !consumerSecret ||
      consumerKey === 'YOUR_REAL_CONSUMER_KEY_HERE' ||
      consumerSecret === 'YOUR_REAL_CONSUMER_SECRET_HERE' ||
      consumerKey === 'your_consumer_key_here' ||
      consumerSecret === 'your_consumer_secret_here';

    if (hasPlaceholderCreds) {
      console.log('[requestToken] Using sample OAuth redirect for development.');
      const sampleRedirectUrl = `https://app.schoology.com/oauth/authorize?oauth_token=mock_token_123&oauth_callback=${encodeURIComponent(
        callbackUrl,
      )}`;
      return NextResponse.redirect(sampleRedirectUrl);
    }

    console.log('[requestToken] Calling requestTokenLogic.', {
      consumerKey: `${consumerKey?.slice(0, 6)}***`,
      projectId: process.env.FIREBASE_PROJECT_ID,
      callbackUrl,
    });

    const redirectUrl = await requestTokenLogic(db, consumerKey, consumerSecret, callbackUrl);
    console.log('[requestToken] Redirect URL received.');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('[requestToken] Failed to get request token.', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to get request token', details: message }, { status: 500 });
  }
}

