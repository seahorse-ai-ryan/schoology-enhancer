import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

/**
 * Manage grading periods (marking periods) for the school
 * GET: List existing grading periods
 * POST: Create default grading periods for the school year
 */
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
    
    // Check admin role
    const roleDoc = await db.collection('app_roles').doc(userId).get();
    const roles: string[] = (roleDoc.exists && Array.isArray((roleDoc.data() as any)?.roles)) ? (roleDoc.data() as any).roles : [];
    if (!roles.includes('admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const apiKey = process.env.SCHOOLOGY_ADMIN_KEY;
    const apiSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'Missing admin API credentials' }, { status: 500 });

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    const oauthClient = new OAuth({
      consumer: { key: apiKey, secret: apiSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    // First, get the school ID
    const schoolRes = await (async () => {
      const schoolUrl = `${SCHOOLOGY_API_URL}/schools`;
      const schoolReq = { url: schoolUrl, method: 'GET' } as any;
      const schoolHeaders = oauthClient.toHeader(oauthClient.authorize(schoolReq, undefined));
      const h = new Headers();
      for (const k in schoolHeaders) h.append(k, (schoolHeaders as any)[k]);
      h.append('Accept', 'application/json');
      return await fetch(schoolUrl, { headers: h });
    })();
    
    if (!schoolRes.ok) {
      const errText = await schoolRes.text();
      return NextResponse.json({ error: 'Failed to fetch school', details: errText }, { status: schoolRes.status });
    }
    
    const schoolData = await schoolRes.json();
    const schools = Array.isArray(schoolData?.schools?.school) ? schoolData.schools.school : 
                    Array.isArray(schoolData?.school) ? schoolData.school : 
                    schoolData?.schools?.school ? [schoolData.schools.school] :
                    schoolData?.school ? [schoolData.school] : [];
    
    if (schools.length === 0) {
      return NextResponse.json({ error: 'No schools found' }, { status: 404 });
    }
    
    const schoolId = schools[0].id;
    console.log('[admin/grading-periods] GET School ID:', schoolId);

    // Fetch grading periods for this school
    const url = `${SCHOOLOGY_API_URL}/schools/${schoolId}/gradingperiods`;
    const req = { url, method: 'GET' } as any;
    const authHeaders = oauthClient.toHeader(oauthClient.authorize(req, undefined));
    const headers = new Headers();
    for (const k in authHeaders) headers.append(k, (authHeaders as any)[k]);
    headers.append('Accept', 'application/json');

    console.log('[admin/grading-periods] GET URL:', url);
    const response = await fetch(url, { headers });
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[admin/grading-periods] GET Failed:', { status: response.status, body: responseText });
      return NextResponse.json({ 
        error: 'Failed to fetch grading periods', 
        status: response.status,
        details: responseText,
        schoolId 
      }, { status: response.status });
    }

    const data = JSON.parse(responseText);
    const periods = data?.gradingperiod || data?.gradingperiods?.gradingperiod || [];
    const periodsArray = Array.isArray(periods) ? periods : (periods ? [periods] : []);

    return NextResponse.json({ 
      gradingPeriods: periodsArray,
      count: periodsArray.length,
      schoolId 
    });
  } catch (error) {
    console.error('[admin/grading-periods] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const apiKey = process.env.SCHOOLOGY_ADMIN_KEY;
    const apiSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'Missing admin API credentials' }, { status: 500 });

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    const oauthClient = new OAuth({
      consumer: { key: apiKey, secret: apiSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    // First, get the school ID
    const schoolRes = await (async () => {
      const schoolUrl = `${SCHOOLOGY_API_URL}/schools`;
      const schoolReq = { url: schoolUrl, method: 'GET' } as any;
      const schoolHeaders = oauthClient.toHeader(oauthClient.authorize(schoolReq, undefined));
      const h = new Headers();
      for (const k in schoolHeaders) h.append(k, (schoolHeaders as any)[k]);
      h.append('Accept', 'application/json');
      return await fetch(schoolUrl, { headers: h });
    })();
    
    if (!schoolRes.ok) {
      const errText = await schoolRes.text();
      return NextResponse.json({ error: 'Failed to fetch school', details: errText }, { status: schoolRes.status });
    }
    
    const schoolData = await schoolRes.json();
    const schools = Array.isArray(schoolData?.schools?.school) ? schoolData.schools.school : 
                    Array.isArray(schoolData?.school) ? schoolData.school : 
                    schoolData?.schools?.school ? [schoolData.schools.school] :
                    schoolData?.school ? [schoolData.school] : [];
    
    if (schools.length === 0) {
      return NextResponse.json({ error: 'No schools found' }, { status: 404 });
    }
    
    const schoolId = schools[0].id;
    console.log('[admin/grading-periods] POST School ID:', schoolId);

    // Create a simple full-year grading period for 2025-2026
    const gradingPeriod = {
      title: '2025-2026 Full Year',
      start: '2025-08-15', // Adjust to your school year
      end: '2026-06-15'
    };

    const url = `${SCHOOLOGY_API_URL}/schools/${schoolId}/gradingperiods`;
    
    // Include body params in OAuth signature for form-urlencoded
    const bodyParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(gradingPeriod)) {
      if (value === undefined || value === null) continue;
      bodyParams[key] = String(value);
    }
    
    const req = { url, method: 'POST', data: bodyParams } as any;
    console.log('[admin/grading-periods] Request object for OAuth:', JSON.stringify(req, null, 2));
    
    const authHeaders = oauthClient.toHeader(oauthClient.authorize(req, undefined as any));
    console.log('[admin/grading-periods] OAuth headers:', authHeaders);
    
    const headers = new Headers();
    for (const k in authHeaders) headers.append(k, (authHeaders as any)[k]);
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams(bodyParams).toString();
    console.log('[admin/grading-periods] POST URL:', url);
    console.log('[admin/grading-periods] Creating grading period:', gradingPeriod);
    console.log('[admin/grading-periods] Body params for signature:', bodyParams);
    console.log('[admin/grading-periods] Encoded body:', body);

    const response = await fetch(url, { method: 'POST', headers, body });
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[admin/grading-periods] POST Failed:', { status: response.status, body: responseText });
      return NextResponse.json({ 
        error: 'Failed to create grading period', 
        status: response.status,
        details: responseText,
        schoolId 
      }, { status: response.status });
    }

    const data = JSON.parse(responseText);
    console.log('[admin/grading-periods] Created successfully:', data);

    return NextResponse.json({ 
      ok: true, 
      gradingPeriod: data,
      schoolId 
    });
  } catch (error) {
    console.error('[admin/grading-periods] POST Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
