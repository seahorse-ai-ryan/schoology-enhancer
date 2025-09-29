'use client';

import { useState } from 'react';

export default function AdminToolsPage() {
  const [seed, setSeed] = useState('carter-mock');
  const [dryRun, setDryRun] = useState(true);
  const [log, setLog] = useState<string>('');

  async function postJson(url: string, body?: any) {
    try {
      setLog((prev) => `${prev}\n${url} → …`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      setLog((prev) => `${prev}\n${url} → ${res.status}\n${text}`);
    } catch (e: any) {
      setLog((prev) => `${prev}\n${url} → error\n${String(e?.message || e)}`);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>Admin Tools</h1>
      <p>Use this page to bootstrap admin role and run seeds. You must be logged in.</p>

      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Bootstrap Admin Role</h2>
        <button onClick={() => postJson('/api/admin/bootstrap')}>Grant Myself Admin</button>
      </div>

      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Run Sandbox Seed</h2>
        <label>
          Dataset:&nbsp;
          <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="carter-mock" />
        </label>
        <label style={{ marginLeft: 16 }}>
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} /> Dry run
        </label>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => postJson('/api/admin/seed', { seed, dryRun })}>Run Seed</button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Output</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 12, borderRadius: 6 }}>{log}</pre>
      </div>
    </div>
  );
}


