import { NextRequest, NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export const runtime = 'nodejs';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const CACHE_TTL_MS = 60 * 1000;

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
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

/**
 * Get upcoming assignments across all courses
 * GET /api/schoology/upcoming?days=7
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const days = parseInt(request.nextUrl.searchParams.get('days') || '7');

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    
    const db = getFirestore();
    const parentDoc = await db.collection('parents').doc(String(userId)).get();
    const activeChildId = (parentDoc.exists ? parentDoc.data()?.activeChildId : null) || null;
    const targetUserId = activeChildId || userId;

    // Check cache
    const cacheKey = `upcoming_${targetUserId}_${days}`;
    const cacheDoc = await db.collection('cache_upcoming').doc(cacheKey).get();
    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const cacheAge = Date.now() - (cacheData?.cachedAt || 0);
      if (cacheAge < CACHE_TTL_MS) {
        return NextResponse.json({ upcoming: cacheData?.upcoming || [], source: 'cached' });
      }
    }

    // Fetch all sections
    const sectionsResponse = await makeSchoologyRequest(
      `${SCHOOLOGY_API_URL}/users/${targetUserId}/sections`,
      targetUserId
    );
    const sections = sectionsResponse.section || [];
    
    const now = new Date();
    const futureLimit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const upcomingAssignments = [];
    
    // Fetch assignments from each section
    for (const section of sections) {
      try {
        const [assignmentsRes, gradesRes, categoriesRes] = await Promise.all([
          makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/assignments?limit=50`, targetUserId),
          makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/grades`, targetUserId).catch(() => ({ grades: { grade: [] } })),
          makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/grading_categories`, targetUserId).catch(() => ({ grading_category: [] }))
        ]);
        
        const assignments = assignmentsRes.assignment || [];
        const grades = gradesRes?.grades?.grade || [];
        const categories = categoriesRes.grading_category || [];
        
        const categoryMap = new Map();
        categories.forEach((c: any) => categoryMap.set(c.id, c.title));
        
        const gradeMap = new Map();
        grades.forEach((g: any) => {
          if (g.assignment_id) gradeMap.set(g.assignment_id, g);
        });
        
        assignments.forEach((a: any) => {
          const dueDate = new Date(a.due);
          
          // Only include future assignments within the day range
          if (dueDate > now && dueDate <= futureLimit) {
            const catId = a.grading_category || a.grading_category_id;
            const categoryName = catId ? (categoryMap.get(parseInt(catId)) || 'Uncategorized') : 'Uncategorized';
            const gradeInfo = gradeMap.get(a.id);
            
            upcomingAssignments.push({
              id: a.id,
              title: a.title,
              due: a.due,
              categoryName,
              courseName: section.course_title,
              courseId: section.id,
              hasGrade: !!gradeInfo,
              daysUntilDue: Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
            });
          }
        });
      } catch (error) {
        console.error(`Failed to fetch assignments for section ${section.id}:`, error);
      }
    }
    
    // Sort by due date
    upcomingAssignments.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
    
    // Cache
    try {
      await db.collection('cache_upcoming').doc(cacheKey).set({
        upcoming: upcomingAssignments,
        cachedAt: Date.now(),
      });
    } catch (cacheError) {
      console.error('[upcoming] Cache failed:', cacheError);
    }

    return NextResponse.json({ upcoming: upcomingAssignments, source: 'live' });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch upcoming', details: message }, { status: 500 });
  }
}

