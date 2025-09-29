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

    const docRef = db.collection('app_roles').doc(userId);
    await docRef.set({ roles: ['admin'], updatedAt: Date.now() }, { merge: true });

    return NextResponse.json({ ok: true, userId, roles: ['admin'] });
  } catch (error) {
    console.error('[admin/bootstrap] Error', error);
    return NextResponse.json({ error: 'Bootstrap failed' }, { status: 500 });
  }
}


