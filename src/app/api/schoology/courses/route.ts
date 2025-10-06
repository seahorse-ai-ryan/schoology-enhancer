import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

/**
 * Fetch courses (sections) for the authenticated user or active child
 * GET /api/schoology/courses
 */
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
    const db = getFirestore();

    // Check if there's an active child selected
    const parentDoc = await db.collection('parents').doc(String(userId)).get();
    const activeChildId = (parentDoc.exists ? (parentDoc.data() as any)?.activeChildId : null) || null;
    
    // If active child, fetch their courses; otherwise fetch parent's courses
    const targetUserId = activeChildId || userId;
    
    // Get user's OAuth tokens
    const userDoc = await db.collection('users').doc(String(userId)).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { accessToken, accessSecret } = userDoc.data() as any;
    
    // If user doesn't have OAuth tokens (e.g., Mock users created via admin API),
    // use admin credentials to fetch their data
    const useAdminCredentials = !accessToken || !accessSecret;
    
    let consumerKey: string;
    let consumerSecret: string;
    let token: { key: string; secret: string } | undefined;
    let apiPath: string;
    
    if (useAdminCredentials) {
      consumerKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
      consumerSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';
      if (!consumerKey || !consumerSecret) {
        return NextResponse.json({ error: 'Server missing admin credentials' }, { status: 500 });
      }
      // Use admin credentials (2-legged OAuth, no token)
      // Fetch courses for the specific user ID
      apiPath = `/users/${targetUserId}/sections`;
      console.log('[schoology/courses] Using admin credentials for user without OAuth tokens:', targetUserId);
    } else {
      consumerKey = process.env.SCHOOLOGY_CONSUMER_KEY || '';
      consumerSecret = process.env.SCHOOLOGY_CONSUMER_SECRET || '';
      if (!consumerKey || !consumerSecret) {
        return NextResponse.json({ error: 'Server missing consumer credentials' }, { status: 500 });
      }
      // Use user's OAuth tokens (3-legged OAuth)
      token = { key: accessToken as string, secret: accessSecret as string };
      
      if (activeChildId) {
        // Fetch child's courses using parent's OAuth tokens
        apiPath = `/users/${activeChildId}/sections`;
      } else {
        // Fetch own courses
        apiPath = `/users/me/sections`;
      }
    }

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    const oauthClient = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    const ts = Date.now();
    const requestData = {
      url: `${SCHOOLOGY_API_URL}${apiPath}?format=json&ts=${ts}`,
      method: 'GET'
    } as any;
    
    const authHeader = token
      ? oauthClient.toHeader(oauthClient.authorize(requestData, token))
      : oauthClient.toHeader(oauthClient.authorize(requestData));
    
    const headers = new Headers();
    for (const k in authHeader) headers.append(k, (authHeader as any)[k]);
    headers.append('Accept', 'application/json');
    headers.append('Cache-Control', 'no-cache');

    if (useAdminCredentials) {
      headers.append('X-Schoology-Run-As', String(targetUserId));
    }

    let res = await fetch(requestData.url, { headers, redirect: 'manual' as any });
    
    // Handle redirects
    if (res.status === 301 || res.status === 302 || res.status === 303) {
      const location = res.headers.get('location');
      if (location) {
        const redirected = { url: location, method: 'GET' } as any;
        const redirectHeader = token
          ? oauthClient.toHeader(oauthClient.authorize(redirected, token))
          : oauthClient.toHeader(oauthClient.authorize(redirected));
        const redirectHeaders = new Headers();
        for (const k in redirectHeader) redirectHeaders.append(k, (redirectHeader as any)[k]);
        redirectHeaders.append('Accept', 'application/json');
        redirectHeaders.append('Cache-Control', 'no-cache');
        if (useAdminCredentials) {
          redirectHeaders.append('X-Schoology-Run-As', String(targetUserId));
        }
        res = await fetch(location, { headers: redirectHeaders });
      }
    }

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('[schoology/courses] Fetch failed:', res.status, errorBody);
      return NextResponse.json(
        { error: 'Failed to fetch courses', status: res.status, details: errorBody },
        { status: 502 }
      );
    }

    const raw = await res.json();
    console.log('[schoology/courses] Raw response:', JSON.stringify(raw).substring(0, 500));
    
    // Schoology API wraps sections in a "section" array
    const sections = raw && typeof raw === 'object' && 'section' in raw
      ? (Array.isArray(raw.section) ? raw.section : [raw.section])
      : (Array.isArray(raw) ? raw : []);

    // Transform sections to our course format
    const courses = sections.map((section: any) => {
      // Parse teacher from section data
      let teacherName = 'Teacher';
      if (section.instructors) {
        // instructors might be a string or an object
        if (typeof section.instructors === 'string') {
          teacherName = section.instructors;
        } else if (typeof section.instructors === 'object' && section.instructors.instructor) {
          const inst = Array.isArray(section.instructors.instructor)
            ? section.instructors.instructor[0]
            : section.instructors.instructor;
          teacherName = inst?.name_display || inst?.name || 'Teacher';
        }
      }
      
      return {
        id: String(section.id || section.section_id || ''),
        externalId: String(section.id || section.section_id || ''),
        code: section.course_code || section.section_code || '',
        name: section.course_title || section.section_title || 'Untitled Course',
        sectionTitle: section.section_title || '',
        courseCode: section.course_code || '',
        sectionCode: section.section_code || section.section_school_code || '',
        subject: section.subject_area || 'General',
        gradeLevel: section.grade_level_range_start || '',
        credits: parseFloat(section.credits || '0'),
        academicYear: section.grading_periods?.[0]?.title || '2025-2026',
        semester: 'Fall 2025',
        teacher: {
          id: section.admin?.[0]?.uid || '',
          name: teacherName,
          email: '',
          department: section.department || ''
        },
        description: section.description || '',
        isActive: section.active !== '0',
        dataSource: useAdminCredentials ? 'admin:live' : 'live',
        lastUpdated: new Date(),
        sourceTimestamp: new Date()
      };
    });

    console.log('[schoology/courses] Returning', courses.length, 'courses');

    return NextResponse.json({
      courses,
      total: courses.length,
      source: useAdminCredentials ? 'admin:live' : 'live'
    });

  } catch (error) {
    console.error('[schoology/courses] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
