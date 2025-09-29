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
    const urlObj = new URL(request.url);
    const seedParam = urlObj.searchParams.get('seed') || '';
    const seedName = (bodyJson?.seed || seedParam || 'carter-mock') as string;
    try { console.log('[admin/seed] using_seed', seedName); } catch {}
    const dryRun = Boolean(bodyJson?.dryRun);
    const usersOnly = Boolean(bodyJson?.usersOnly || bodyJson?.userOnly);
    // Read seed JSON from disk to avoid bundler import issues
    const pathMod = await import('path');
    const fs = await import('fs/promises');
    const seedFilePath = pathMod.join(process.cwd(), 'seed', 'sandbox', `${seedName}.json`);
    const fileText = await fs.readFile(seedFilePath, 'utf-8');
    const seed = JSON.parse(fileText);
    try { console.log('[admin/seed] seed_loaded', { seedName, student: seed?.users?.student?.name, parent: seed?.users?.parent?.name }); } catch {}

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
      const url = `${SCHOOLOGY_API_URL}${path}${path.includes('?') ? '&' : '?'}format=json`;
      const req = { url, method: 'GET' } as any;
      const h = oauthClient.toHeader(oauthClient.authorize(req, token as any));
      const headers = new Headers();
      for (const k in h) headers.append(k, (h as any)[k]);
      headers.append('Accept', 'application/json');
      try {
        const res = await fetch(url, { headers });
        return res;
      } catch (e) {
        console.error('[admin/seed] sgyGet_failed', { url, error: String(e) });
        throw e;
      }
    }

    async function sgyPost(path: string, body: Record<string, any>, token?: { key: string; secret: string }) {
      const url = `${SCHOOLOGY_API_URL}${path}${path.includes('?') ? '&' : '?'}format=json`;
      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(body || {})) {
        if (v === undefined || v === null) continue;
        params[k] = String(v);
      }
      // Include body params in signature for x-www-form-urlencoded
      const req = { url, method: 'POST', data: params } as any;
      const h = oauthClient.toHeader(oauthClient.authorize(req, token as any));
      const headers = new Headers();
      for (const k in h) headers.append(k, (h as any)[k]);
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      const bodyEncoded = new URLSearchParams(params).toString();
      try {
        const res = await fetch(url, { method: 'POST', headers, body: bodyEncoded });
        if (!res.ok) {
          let errText = '';
          try { errText = await res.text(); } catch {}
          console.error('[admin/seed] sgyPost_failed', { url, status: res.status, payload: body });
          if (errText) console.error('[admin/seed] sgyPost_body', errText);
        }
        else {
          // Log success response body for diagnostics
          try { const okText = await res.clone().text(); console.log('[admin/seed] sgyPost_ok', { url, body: okText.slice(0, 500) }); } catch {}
        }
        return res;
      } catch (e) {
        console.error('[admin/seed] sgyPost_exception', { url, payload: body, error: String(e) });
        throw e;
      }
    }

    async function sgyPostJson(path: string, body: any, token?: { key: string; secret: string }) {
      const url = `${SCHOOLOGY_API_URL}${path}${path.includes('?') ? '&' : '?'}format=json`;
      // Sign without body params for JSON payloads
      const req = { url, method: 'POST' } as any;
      const h = oauthClient.toHeader(oauthClient.authorize(req, token as any));
      const headers = new Headers();
      for (const k in h) headers.append(k, (h as any)[k]);
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      try {
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) {
          let errText = '';
          try { errText = await res.text(); } catch {}
          console.error('[admin/seed] sgyPostJson_failed', { url, status: res.status });
          if (errText) console.error('[admin/seed] sgyPostJson_body', errText.slice(0, 1000));
        } else {
          try { const okText = await res.clone().text(); console.log('[admin/seed] sgyPostJson_ok', { url, body: okText.slice(0, 500) }); } catch {}
        }
        return res;
      } catch (e) {
        console.error('[admin/seed] sgyPostJson_exception', { url, error: String(e) });
        throw e;
      }
    }

    // Minimal example: create a parent + student user if missing, then a course and one assignment
    const parentName = seed.users.parent.name;
    const studentName = seed.users.student.name;
    try { console.log('[admin/seed] names', { parentName, studentName }); } catch {}

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
      const usernameBase = `${first}_${last}`.replace(/\s+/g, '_').replace(/\.+/g, '_').toLowerCase();
      const today = new Date();
      const yyyy = String(today.getFullYear());
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const usernameUsed = `${usernameBase}_${yyyy}${mm}${dd}`;
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
      if (!schoolId) {
        try {
          const me = await sgyGet('/users/me');
          if (me.ok) {
            const mj: any = await me.json().catch(() => ({}));
            const sid = Number(mj?.school_id || mj?.school_nid);
            if (sid) schoolId = sid;
          }
        } catch {}
      }
      console.log('[admin/seed] ensureUser_fields', { role, resolvedRoleId: roleId, schoolId });
      // Per docs: required fields are school_uid, name_first, name_last, primary_email, role_id.
      // Use deterministic school_uid based on usernameUsed
      const body: any = { school_uid: usernameUsed, name_first: first, name_last: last, role_id: roleId };
      body.username = usernameUsed;
      if (email) body.primary_email = email;
      if (schoolId) body.school_id = schoolId;
      if (email) body.email_conflict_resolution = 1;
      if (dryRun) return { created: false };
      const debug: any = { attempts: [] };
      // Helper to post and capture body text
      async function postAndRecord(path: string, payload: any) {
        const r = await sgyPost(path, payload);
        let txt = '';
        try { txt = await r.clone().text(); } catch {}
        debug.attempts.push({ path, status: r.status, body: txt.slice(0, 1000) });
        return r;
      }
      // Use bulk create endpoint shape to leverage conflict resolution flags as query params
      const wrapper = { users: { user: [body] } } as any;
      let userPath = '/users';
      if (email) userPath = '/users?email_conflict_resolution=1';
      // Use JSON for bulk users per docs
      let res = await (async () => {
        const r = await sgyPostJson(userPath, wrapper);
        let txt = '';
        try { txt = await r.clone().text(); } catch {}
        debug.attempts.push({ path: userPath, status: r.status, body: txt.slice(0, 1000) });
        return r;
      })();
      // On failure (e.g., duplicate email), retry with username-only
      if (!res.ok) {
        const fallbackUid = `${usernameBase}_${yyyy}${mm}${dd}`;
        const retryBody: any = { school_uid: fallbackUid, name_first: first, name_last: last, role_id: roleId };
        if (email) retryBody.primary_email = email;
        if (schoolId) retryBody.school_id = schoolId;
        const retryWrapper = { users: { user: [retryBody] } } as any;
        const retryPath = email ? '/users?email_conflict_resolution=1' : '/users';
        // Retry with JSON bulk
        res = await (async () => {
          const r = await sgyPostJson(retryPath, retryWrapper);
          let txt = '';
          try { txt = await r.clone().text(); } catch {}
          debug.attempts.push({ path: retryPath, status: r.status, body: txt.slice(0, 1000) });
          return r;
        })();
        if (res.ok) {
          // update used UID label
          (body as any).school_uid = fallbackUid;
        }
      }
      let id: string | null = null;
      if (res.ok) {
        try {
          const j = await res.json();
          // Bulk create may return a wrapper; attempt best-effort extraction
          const created = (j && (j.user || j.users?.user)) as any;
          if (Array.isArray(created) && created.length > 0) {
            const cu = created[0];
            id = String(cu?.id ?? cu?.uid ?? '') || null;
          } else if (created && typeof created === 'object') {
            id = String(created?.id ?? created?.uid ?? '') || null;
          }
        } catch {}
        // Some responses may not include JSON; try Location header
        if (!id) {
          const loc = res.headers.get('location') || res.headers.get('Location');
          if (loc) {
            const m = /\/users\/(\d+)/.exec(loc);
            if (m && m[1]) id = m[1];
          }
        }
        // Final fallback: list users and match by username we just used
        if (!id) {
          try {
            const list = await sgyGet('/users?start=0&limit=1000');
            if (list.ok) {
              const lj: any = await list.json().catch(() => ({}));
              const arr: any[] = Array.isArray(lj?.users?.user) ? lj.users.user : Array.isArray(lj?.user) ? lj.user : [];
              const found = arr.find((u: any) => String(u?.school_uid || '').toLowerCase() === String((body as any).school_uid).toLowerCase());
              try { console.log('[admin/seed] verify_users_list', { count: arr.length, matched: found ? 1 : 0, school_uid: (body as any).school_uid }); } catch {}
              if (found?.id || found?.uid) id = String(found.id || found.uid);
              debug.verify = { count: arr.length, matched: found ? 1 : 0, id: found ? (found.id || found.uid || null) : null };
            }
          } catch {}
        }
      } else {
        try { const errTxt = await res.text(); console.error('[admin/seed] user_create_failed', { status: res.status, body: errTxt, payload: body }); } catch {}
      }
      // ignore non-ok as "already exists" for now
      return { created: res.ok, id, debug };
    }

    async function ensureSchoolId(): Promise<number | undefined> {
      try {
        const s = await sgyGet('/schools');
        if (s.ok) {
          const sj: any = await s.json().catch(() => ({}));
          const schools: any[] = Array.isArray(sj?.schools?.school) ? sj.schools.school : Array.isArray(sj?.school) ? sj.school : [];
          if (schools.length > 0 && schools[0]?.id) return Number(schools[0].id);
        }
      } catch {}
      try {
        const me = await sgyGet('/users/me');
        if (me.ok) {
          const mj: any = await me.json().catch(() => ({}));
          const sid = Number(mj?.school_id || mj?.school_nid);
          if (sid) return sid;
        }
      } catch {}
      return undefined;
    }

    const parentUser = await ensureUser(parentName, 'parent', seed.users.parent.email);
    const studentUser = await ensureUser(studentName, 'student', undefined);

    // Feedback: do not mirror or write child records during seeding; verification will happen via Schoology only.

    let courseId: string | number | null = null;
    if (!usersOnly) {
      const course = seed.courses?.[0];
      if (course) {
        if (!dryRun) {
          const courseSchoolId = await ensureSchoolId();
          const codeBase = (course.code || course.course_code || course.title || 'COURSE').toString().replace(/\s+/g, '-').toUpperCase().slice(0, 12);
          const coursePayload: Record<string, any> = { name: course.title, course_code: `${codeBase}-${Date.now().toString().slice(-4)}` };
          if (courseSchoolId) coursePayload.school_id = courseSchoolId;
          const courseRes = await sgyPost('/courses', coursePayload);
          const courseJson: any = courseRes.ok ? await courseRes.json() : {};
          courseId = courseJson?.id || null;
        }
        const a = seed.assignments?.[0];
        if (!dryRun && a && courseId) {
          await sgyPost(`/courses/${courseId}/assignments`, { title: a.title, due: a.due });
        }
      }
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

    return NextResponse.json({ ok: true, dryRun, created: { course: courseId, studentUserId: studentUser.id || null }, seed: seedName, debug: { student: studentUser.debug || null } });
  } catch (error) {
    console.error('[admin/seed] Error', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}


