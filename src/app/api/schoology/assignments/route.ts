import { NextRequest, NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export const runtime = 'nodejs';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

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

/**
 * Fetch assignments for a specific section
 * GET /api/schoology/assignments?sectionId={id}
 * 
 * Returns assignments grouped by grading category
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('schoology_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const sectionId = request.nextUrl.searchParams.get('sectionId');
    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId parameter required' }, { status: 400 });
    }

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    
    const db = getFirestore();
    const parentDoc = await db.collection('parents').doc(String(userId)).get();
    const activeChildId = (parentDoc.exists ? parentDoc.data()?.activeChildId : null) || null;
    const targetUserId = activeChildId || userId;

    // Check cache first
    const cacheKey = `${targetUserId}_${sectionId}`;
    const cacheDoc = await db.collection('cache_assignments').doc(cacheKey).get();
    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const cacheAge = Date.now() - (cacheData?.cachedAt || 0);
      
      if (cacheAge < CACHE_TTL_MS) {
        console.log(`[assignments] Returning cached data for section ${sectionId} (age: ${Math.round(cacheAge / 1000)}s)`);
        return NextResponse.json({
          assignments: cacheData?.assignments || [],
          categories: cacheData?.categories || [],
          assignmentsByCategory: cacheData?.assignmentsByCategory || {},
          source: 'cached',
          cachedAt: cacheData?.cachedAt
        });
      }
    }

    // Fetch from Schoology
    const [assignmentsResponse, gradesResponse] = await Promise.all([
      makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${sectionId}/assignments?limit=200`, targetUserId),
      makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${sectionId}/grades`, targetUserId)
    ]);

    const assignments = assignmentsResponse.assignment || [];
    const gradesData = gradesResponse?.grades?.grade || [];
    
    // Build a map of assignment grades (assignment_id → grade data)
    const assignmentGradesMap: Record<string, any> = {};
    gradesData.forEach((g: any) => {
      if (g.assignment_id) {
        assignmentGradesMap[g.assignment_id] = {
          grade: g.grade,
          maxPoints: g.max_points,
          comment: g.comment || null,
        };
      }
    });

    // Fetch grading categories
    let categories = [];
    try {
      const categoriesResponse = await makeSchoologyRequest(
        `${SCHOOLOGY_API_URL}/sections/${sectionId}/grading_categories`,
        targetUserId
      );
      categories = categoriesResponse.grading_category || [];
    } catch (error) {
      console.log('[assignments] No grading categories for this section');
    }

    // Group assignments by category
    const assignmentsByCategory: Record<string, any[]> = {};
    const categoryMap = new Map();
    categories.forEach((cat: any) => {
      categoryMap.set(cat.id, cat.title);
      assignmentsByCategory[cat.title] = [];
    });

    // Add uncategorized bucket
    assignmentsByCategory['Uncategorized'] = [];

    // Process each assignment
    const processedAssignments = assignments.map((a: any) => {
      const gradeData = assignmentGradesMap[a.id];
      const categoryName = a.grading_category_id 
        ? (categoryMap.get(a.grading_category_id) || 'Uncategorized')
        : 'Uncategorized';

      const assignment = {
        id: a.id,
        title: a.title,
        due: a.due,
        maxPoints: a.max_points,
        grade: gradeData?.grade || null,
        comment: gradeData?.comment || null,
        categoryName,
        categoryId: a.grading_category_id || null,
      };

      assignmentsByCategory[categoryName].push(assignment);
      return assignment;
    });

    // Remove empty categories
    Object.keys(assignmentsByCategory).forEach(key => {
      if (assignmentsByCategory[key].length === 0) {
        delete assignmentsByCategory[key];
      }
    });

    // Cache the result
    try {
      await db.collection('cache_assignments').doc(cacheKey).set({
        assignments: processedAssignments,
        categories,
        assignmentsByCategory,
        cachedAt: Date.now(),
        sectionId,
        targetUserId: String(targetUserId),
      });
      console.log(`[assignments] Cached ${processedAssignments.length} assignments for section ${sectionId}`);
    } catch (cacheError) {
      console.error('[assignments] Failed to cache data:', cacheError);
    }

    return NextResponse.json({
      assignments: processedAssignments,
      categories,
      assignmentsByCategory,
      source: 'live',
      cachedAt: Date.now()
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch assignments', details: message }, { status: 500 });
  }
}

