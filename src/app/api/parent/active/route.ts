import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

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
    const doc = await db.collection('parents').doc(String(userId)).get();
    const activeChildId = (doc.exists ? (doc.data() as any)?.activeChildId : null) || null;
    return NextResponse.json({ activeChildId });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const childId = String(body?.childId || '');
    // Allow empty string to clear active child (return to parent view)
    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const db = getFirestore();
    if (childId === '') {
      // Clear active child
      await db.collection('parents').doc(String(userId)).set({ activeChildId: null, updatedAt: Date.now() }, { merge: true });
      return NextResponse.json({ ok: true, activeChildId: null });
    }

    // SECURITY CHECK: Verify the requested childId belongs to the authenticated parent
    const parentDoc = await db.collection('parents').doc(String(userId)).get();
    const parentData = parentDoc.exists ? parentDoc.data() : null;
    const allowedChildren = parentData?.childrenIds || [];
    
    if (!allowedChildren.includes(childId)) {
      console.warn(`[SECURITY] User ${userId} attempted to access unauthorized child ${childId}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.collection('parents').doc(String(userId)).set({ activeChildId: childId, updatedAt: Date.now() }, { merge: true });
    return NextResponse.json({ ok: true, activeChildId: childId });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


