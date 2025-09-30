import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

export const runtime = 'nodejs';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

/**
 * Attempt to create assignments programmatically via Schoology API
 * This may fail with 401 due to permissions - use as a test
 */
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
    
    // Check admin role
    const roleDoc = await db.collection('app_roles').doc(userId).get();
    const roles: string[] = (roleDoc.exists && Array.isArray((roleDoc.data() as any)?.roles)) ? (roleDoc.data() as any).roles : [];
    if (!roles.includes('admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { sectionId, seedName = 'carter-mock' } = body;

    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId required' }, { status: 400 });
    }

    // Read seed JSON
    const pathMod = await import('path');
    const fs = await import('fs/promises');
    const seedFilePath = pathMod.join(process.cwd(), 'seed', 'sandbox', `${seedName}.json`);
    const fileText = await fs.readFile(seedFilePath, 'utf-8');
    const seed = JSON.parse(fileText);

    // Use admin credentials
    const adminKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
    const adminSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';

    if (!adminKey || !adminSecret) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 });
    }

    const oauthClient = new OAuth({
      consumer: { key: adminKey, secret: adminSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    const created = [];
    const errors = [];

    // Create assignments for this section
    for (const assignment of seed.assignments || []) {
      try {
        const url = `${SCHOOLOGY_API_URL}/sections/${sectionId}/assignments`;
        
        const dueDate = assignment.due ? new Date(assignment.due).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const payload = {
          title: assignment.title,
          description: assignment.description || '',
          due: dueDate,
          max_points: assignment.points || 10,
          type: assignment.category || 'assignment',
          published: 1
        };

        const req = { url, method: 'POST', data: payload } as any;
        const authHeaders = oauthClient.toHeader(oauthClient.authorize(req, undefined as any));
        
        const headers = new Headers();
        for (const k in authHeaders) headers.append(k, (authHeaders as any)[k]);
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          created.push({ title: assignment.title, id: data.id });
        } else {
          const errText = await response.text().catch(() => 'unable to read error');
          errors.push({ title: assignment.title, status: response.status, error: errText.slice(0, 200) });
        }
      } catch (error) {
        errors.push({ title: assignment.title, error: String(error) });
      }
    }

    return NextResponse.json({ 
      success: created.length > 0,
      created, 
      errors,
      message: `Created ${created.length} assignments, ${errors.length} failures`
    });

  } catch (error) {
    console.error('[admin/seed/assignments] Error:', error);
    return NextResponse.json({ error: 'Failed to create assignments', details: String(error) }, { status: 500 });
  }
}
