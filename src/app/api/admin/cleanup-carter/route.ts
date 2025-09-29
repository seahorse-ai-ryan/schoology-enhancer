import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const db = getFirestore();

    // Remove any local mirror entries for Carter to ensure we rely on Schoology as source of truth.
    const parentRef = db.collection('parents').doc(String(userId));
    await parentRef.collection('children').doc('Carter Mock').delete().catch(() => {});
    await db.collection('sandboxSeeds').doc('carter-mock').delete().catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}


