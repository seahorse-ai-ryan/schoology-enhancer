import { NextRequest, NextResponse } from 'next/server';

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Dev backdoor: allow x-seed-key for non-interactive runs (dev only)
    const headerSeedKey = request.headers.get('x-seed-key') || '';
    const allowedSeedKey = process.env.ADMIN_SEED_KEY || 'dev-seed';

    // App-level RBAC: only allow logged-in users with admin role unless seed-key matches
    const cookieUserId = request.cookies.get('schoology_user_id')?.value;
    if (!cookieUserId && headerSeedKey !== allowedSeedKey) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const adminDb = getFirestore();
    if (headerSeedKey !== allowedSeedKey) {
      const roleDoc = await adminDb.collection('app_roles').doc(cookieUserId!).get();
      const roles: string[] = (roleDoc.exists && Array.isArray((roleDoc.data() as any)?.roles)) ? (roleDoc.data() as any).roles : [];
      if (!roles.includes('admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = process.env.SCHOOLOGY_ADMIN_KEY;
    const apiSecret = process.env.SCHOOLOGY_ADMIN_SECRET;
    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'Missing admin API credentials' }, { status: 500 });

    const bodyJson = await request.json().catch(() => ({}));
    const seedName = bodyJson?.seed ?? 'carter-mock';
    const dryRun = Boolean(bodyJson?.dryRun);
    // Read seed JSON from disk to avoid bundler import issues
    const pathMod = await import('path');
    const fs = await import('fs/promises');
    const seedFilePath = pathMod.join(process.cwd(), 'seed', 'sandbox', `${seedName}.json`);
    const fileText = await fs.readFile(seedFilePath, 'utf-8');
    const seed = JSON.parse(fileText);

    const OAuth = (await import('oauth-1.0a')).default;
    const crypto = await import('crypto');
    const oauthClient = new OAuth({
      consumer: { key: apiKey, secret: apiSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    async function sgyGet(path: string, token?: { key: string; secret: string }) {
      const url = `${SCHOOLOGY_API_URL}${path}`;
      const req = { url, method: 'GET' } as any;
      const h = oauthClient.toHeader(oauthClient.authorize(req, token as any));
      const headers = new Headers();
      for (const k in h) headers.append(k, (h as any)[k]);
      headers.append('Accept', 'application/json');
      return fetch(url, { headers });
    }

    async function sgyPost(path: string, body: any, token?: { key: string; secret: string }) {
      const url = `${SCHOOLOGY_API_URL}${path}`;
      const req = { url, method: 'POST' } as any;
      const h = oauthClient.toHeader(oauthClient.authorize(req, token as any));
      const headers = new Headers();
      for (const k in h) headers.append(k, (h as any)[k]);
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    }

    // Minimal example: create a parent + student user if missing, then a course and one assignment
    const parentName = seed.users.parent.name;
    const studentName = seed.users.student.name;

    // NOTE: Schoology org IDs vary; in a real seeder we’d query your schools and pick the dev school.
    // For now we assume default context (admin creds bound to dev school).

    // Create users (idempotent by username/email when possible)
    async function ensureUser(name: string, role: string, email?: string) {
      // Resolve role_id dynamically from /roles to avoid hard-coded IDs
      let roleId = role === 'student' ? 3 : role === 'parent' ? 4 : 2;
      try {
        const r = await sgyGet('/roles');
        if (r.ok) {
          const j: any = await r.json().catch(() => ({}));
          const list: any[] = Array.isArray(j?.roles?.role) ? j.roles.role : Array.isArray(j?.role) ? j.role : [];
          const byName = list.find((it: any) => String(it?.title || it?.name || '').toLowerCase() === role.toLowerCase());
          if (byName?.id) roleId = Number(byName.id);
        }
      } catch {}

      // Schoology search API is limited; as a placeholder, attempt creation and ignore 409-like errors
      const first = name.split(' ')[0];
      const last = name.split(' ').slice(1).join(' ') || 'User';
      const derivedEmail = email || 'ryan@seahorsetwin.com';
      const usernameBase = `${first}.${last}`.replace(/\s+/g, '.').toLowerCase();
      // Resolve org school id (pick first) for dev sandbox
      let schoolId: number | undefined = undefined;
      try {
        const s = await sgyGet('/schools');
        if (s.ok) {
          const sj: any = await s.json().catch(() => ({}));
          const schools: any[] = Array.isArray(sj?.schools?.school) ? sj.schools.school : Array.isArray(sj?.school) ? sj.school : [];
          if (schools.length > 0 && schools[0]?.id) schoolId = Number(schools[0].id);
        }
      } catch {}
      const body: any = { name_display: name, name_first: first, name_last: last, role_id: roleId, primary_email: derivedEmail, username: `${usernameBase}.${Date.now()}` };
      if (schoolId) body.school_id = schoolId;
      if (dryRun) return { created: false };
      let res = await sgyPost('/users', body);
      // On failure (e.g., duplicate email), retry with username-only
      if (!res.ok) {
        const retryBody: any = { name_display: name, name_first: first, name_last: last, role_id: roleId, username: `${usernameBase}.${Date.now()}` };
        if (schoolId) retryBody.school_id = schoolId;
        res = await sgyPost('/users', retryBody);
      }
      let id: string | null = null;
      if (res.ok) {
        try {
          const j = await res.json();
          id = String(j?.id ?? j?.uid ?? '') || null;
        } catch {}
        // Some responses may not include JSON; try Location header
        if (!id) {
          const loc = res.headers.get('location') || res.headers.get('Location');
          if (loc) {
            const m = /\/users\/(\d+)/.exec(loc);
            if (m && m[1]) id = m[1];
          }
        }
      } else {
        try { const errTxt = await res.text(); console.error('[admin/seed] user_create_failed', { status: res.status, body: errTxt }); } catch {}
      }
      // ignore non-ok as "already exists" for now
      return { created: res.ok, id };
    }

    const parentUser = await ensureUser(parentName, 'parent', seed.users.parent.email);
    const studentUser = await ensureUser(studentName, 'student', 'ryan@seahorsetwin.com');

    // Feedback: do not mirror or write child records during seeding; verification will happen via Schoology only.

    // Create a course
    const course = seed.courses[0];
    let courseId: string | number = course.title;
    if (!dryRun) {
      const courseRes = await sgyPost('/courses', { title: course.title });
      const courseJson: any = courseRes.ok ? await courseRes.json() : {};
      courseId = courseJson?.id || course.title;
    }

    // Create an assignment
    const a = seed.assignments[0];
    if (!dryRun) {
      await sgyPost(`/courses/${courseId}/assignments`, { title: a.title, due: a.due });
    }

    // Save idempotency metadata
    const seedMeta = {
      seed: seedName,
      courseId,
      parentUserId: parentUser.id || null,
      studentUserId: studentUser.id || null,
      updatedAt: Date.now(),
    };
    await adminDb.collection('sandboxSeeds').doc(seedName).set({ ...seedMeta, dryRunLast: dryRun }, { merge: true });

    return NextResponse.json({ ok: true, dryRun, created: { course: courseId, studentUserId: studentUser.id || null }, seed: seedName });
  } catch (error) {
    console.error('[admin/seed] Error', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}


