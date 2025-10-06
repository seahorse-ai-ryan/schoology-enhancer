import { NextRequest, NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export const runtime = 'nodejs';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

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

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    
    const db = getFirestore();
    const parentDoc = await db.collection('parents').doc(String(userId)).get();
    const activeChildId = (parentDoc.exists ? parentDoc.data()?.activeChildId : null) || null;
    const targetUserId = activeChildId || userId;

    const sectionsResponse = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/users/${targetUserId}/sections`, targetUserId);
    const sections = sectionsResponse.section || [];
    
    const gradesMap: Record<string, any> = {};

    for (const section of sections) {
      try {
        const gradeData = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/grades`, targetUserId);
        
        const finalGradeEntry = gradeData?.final_grade?.[0];
        const periodGrade = finalGradeEntry?.period?.[0]?.grade;

        if (periodGrade !== null && periodGrade !== undefined) {
          gradesMap[String(section.id)] = {
            grade: Math.round(periodGrade),
            period_id: finalGradeEntry?.period?.[0]?.period_id || null,
          };
        }
      } catch (error) {
        console.error(`Failed to get grades for section ${section.id}:`, error);
      }
    }
    
    return NextResponse.json({ 
      grades: gradesMap,
      targetUserId: String(targetUserId)
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch grades', details: message }, { status: 500 });
  }
}
