import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const adminDb = getFirestore();

    const docSnap = await adminDb.collection('users').doc(userId).get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = docSnap.data() || {} as any;

    return NextResponse.json({
      id: userId,
      name: (data as any).name || 'Unknown User',
      hasToken: Boolean((data as any).accessToken),
      source: 'admin:emulator'
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
