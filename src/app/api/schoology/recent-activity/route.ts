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
 * Get recent graded assignments (last 14 days)
 * GET /api/schoology/recent-activity?days=14
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const days = parseInt(request.nextUrl.searchParams.get('days') || '14');

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    
    const db = getFirestore();
    const parentDoc = await db.collection('parents').doc(String(userId)).get();
    const activeChildId = (parentDoc.exists ? parentDoc.data()?.activeChildId : null) || null;
    const targetUserId = activeChildId || userId;

    // Check cache
    const cacheKey = `activity_${targetUserId}_${days}`;
    const cacheDoc = await db.collection('cache_activity').doc(cacheKey).get();
    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const cacheAge = Date.now() - (cacheData?.cachedAt || 0);
      if (cacheAge < CACHE_TTL_MS) {
        return NextResponse.json({ activity: cacheData?.activity || [], source: 'cached' });
      }
    }

    // Fetch all sections
    const sectionsResponse = await makeSchoologyRequest(
      `${SCHOOLOGY_API_URL}/users/${targetUserId}/sections`,
      targetUserId
    );
    const sections = sectionsResponse.section || [];
    
    const pastLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentActivity = [];
    
    // Fetch graded assignments from each section
    for (const section of sections) {
      try {
        const [gradesRes, categoriesRes] = await Promise.all([
          makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/grades`, targetUserId),
          makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/grading_categories`, targetUserId).catch(() => ({ grading_category: [] }))
        ]);
        
        const grades = gradesRes?.grades?.grade || [];
        const categories = categoriesRes.grading_category || [];
        
        const categoryMap = new Map();
        categories.forEach((c: any) => categoryMap.set(c.id, c.title));
        
        // Get assignment details for graded items
        const assignmentsRes = await makeSchoologyRequest(
          `${SCHOOLOGY_API_URL}/sections/${section.id}/assignments?limit=100`,
          targetUserId
        );
        const assignments = assignmentsRes.assignment || [];
        const assignmentMap = new Map();
        assignments.forEach((a: any) => {
          assignmentMap.set(a.id, {
            title: a.title,
            categoryId: a.grading_category || a.grading_category_id,
          });
        });
        
        grades.forEach((g: any) => {
          if (!g.timestamp || g.timestamp === 0) return; // No submission date
          
          const submittedDate = new Date(g.timestamp * 1000); // Unix timestamp
          
          // Only include recent submissions
          if (submittedDate >= pastLimit) {
            const assignmentInfo = assignmentMap.get(g.assignment_id);
            if (!assignmentInfo) return;
            
            const catId = assignmentInfo.categoryId;
            const categoryName = catId ? (categoryMap.get(parseInt(catId)) || 'Uncategorized') : 'Uncategorized';
            
            recentActivity.push({
              id: g.assignment_id + '_' + section.id,
              title: assignmentInfo.title,
              courseName: section.course_title,
              courseId: section.id,
              categoryName,
              submittedDate: submittedDate.toISOString(),
              grade: g.grade,
              maxPoints: g.max_points,
            });
          }
        });
      } catch (error) {
        console.error(`Failed to fetch activity for section ${section.id}:`, error);
      }
    }
    
    // Sort by submission date (most recent first)
    recentActivity.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    
    // Cache
    try {
      await db.collection('cache_activity').doc(cacheKey).set({
        activity: recentActivity,
        cachedAt: Date.now(),
      });
    } catch (cacheError) {
      console.error('[activity] Cache failed:', cacheError);
    }

    return NextResponse.json({ activity: recentActivity, source: 'live' });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch recent activity', details: message }, { status: 500 });
  }
}

