import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Admin endpoint to list all users who have logged into the app.
 * Requires admin role in Firestore.
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const db = getFirestore();

    // Check if user has admin role
    const roleDoc = await db.collection('app_roles').doc(userId).get();
    const roles: string[] = (roleDoc.exists && Array.isArray((roleDoc.data() as any)?.roles)) 
      ? (roleDoc.data() as any).roles 
      : [];
    
    if (!roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unknown',
        username: data.username || '',
        email: data.email || '',
        schoolId: data.schoolId || null,
        hasToken: Boolean(data.accessToken),
        isMockUser: data.isMockUser || false,
        lastLogin: data.lastLogin || null,
        createdAt: data.createdAt || null,
      };
    });

    // Sort by last login, most recent first
    users.sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0));

    return NextResponse.json({ 
      users,
      total: users.length,
      stats: {
        withTokens: users.filter(u => u.hasToken).length,
        mockUsers: users.filter(u => u.isMockUser).length,
        realUsers: users.filter(u => !u.isMockUser).length,
      }
    });
  } catch (error) {
    console.error('[admin/users] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


