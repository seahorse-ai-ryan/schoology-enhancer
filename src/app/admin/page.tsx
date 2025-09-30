'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  schoolId: string | null;
  hasToken: boolean;
  isMockUser: boolean;
  lastLogin: number | null;
  createdAt: number | null;
}

export default function AdminToolsPage() {
  const [seed, setSeed] = useState('carter-mock');
  const [dryRun, setDryRun] = useState(true);
  const [log, setLog] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [usersStats, setUsersStats] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [gradingPeriods, setGradingPeriods] = useState<any[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

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

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setUsersStats(data.stats);
      } else {
        const errText = await res.text();
        setLog((prev) => `${prev}\n/api/admin/users → ${res.status} ${errText}`);
      }
    } catch (e: any) {
      setLog((prev) => `${prev}\n/api/admin/users → error: ${String(e?.message || e)}`);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadGradingPeriods() {
    setLoadingPeriods(true);
    try {
      const res = await fetch('/api/admin/grading-periods');
      if (res.ok) {
        const data = await res.json();
        setGradingPeriods(data.gradingPeriods || []);
      } else {
        const errText = await res.text();
        setLog((prev) => `${prev}\n/api/admin/grading-periods → ${res.status} ${errText}`);
      }
    } catch (e: any) {
      setLog((prev) => `${prev}\n/api/admin/grading-periods → error: ${String(e?.message || e)}`);
    } finally {
      setLoadingPeriods(false);
    }
  }

  async function createGradingPeriod() {
    try {
      setLog((prev) => `${prev}\n/api/admin/grading-periods → Creating...`);
      const res = await fetch('/api/admin/grading-periods', { method: 'POST' });
      const text = await res.text();
      setLog((prev) => `${prev}\n/api/admin/grading-periods → ${res.status}\n${text}`);
      if (res.ok) {
        loadGradingPeriods(); // Refresh list
      }
    } catch (e: any) {
      setLog((prev) => `${prev}\n/api/admin/grading-periods → error: ${String(e?.message || e)}`);
    }
  }

  useEffect(() => {
    loadUsers();
    loadGradingPeriods();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: 16 }}>
      <h1>Admin Tools</h1>
      <p>Use this page to bootstrap admin role, run seeds, and view app users. You must be logged in.</p>

      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Registered Users</h2>
        {usersStats && (
          <p style={{ fontSize: 14, color: '#666' }}>
            Total: {usersStats.realUsers + usersStats.mockUsers} | 
            Real: {usersStats.realUsers} | 
            Mock: {usersStats.mockUsers} | 
            With OAuth Tokens: {usersStats.withTokens}
          </p>
        )}
        <button onClick={loadUsers} disabled={loadingUsers} style={{ marginBottom: 12 }}>
          {loadingUsers ? 'Loading...' : 'Refresh Users'}
        </button>
        {users.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Name</th>
                <th style={{ padding: 8 }}>Username</th>
                <th style={{ padding: 8 }}>Email</th>
                <th style={{ padding: 8 }}>Type</th>
                <th style={{ padding: 8 }}>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 11 }}>{user.id}</td>
                  <td style={{ padding: 8 }}>{user.name}</td>
                  <td style={{ padding: 8 }}>{user.username || '—'}</td>
                  <td style={{ padding: 8 }}>{user.email || '—'}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      fontSize: 11,
                      background: user.isMockUser ? '#ffe0e0' : (user.hasToken ? '#e0ffe0' : '#fff0e0'),
                      color: '#333'
                    }}>
                      {user.isMockUser ? 'Mock' : (user.hasToken ? 'Real+Token' : 'Real')}
                    </span>
                  </td>
                  <td style={{ padding: 8, fontSize: 11 }}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic' }}>No users found</p>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Bootstrap Admin Role</h2>
        <button onClick={() => postJson('/api/admin/bootstrap')}>Grant Myself Admin</button>
      </div>

      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Grading Periods</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Grading periods (marking periods) are required for course imports. If your school has none, create one here.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <button onClick={loadGradingPeriods} disabled={loadingPeriods}>
            {loadingPeriods ? 'Loading...' : 'Refresh Periods'}
          </button>
          <button onClick={createGradingPeriod} style={{ background: '#0066cc', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Create Default Period (2025-2026)
          </button>
        </div>
        {gradingPeriods.length > 0 ? (
          <div style={{ padding: 12, background: '#f7f7f7', borderRadius: 4 }}>
            <strong>Existing Grading Periods:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              {gradingPeriods.map((period: any, idx: number) => (
                <li key={idx} style={{ fontSize: 13, marginBottom: 4 }}>
                  <strong>{period.title}</strong> (ID: {period.id}) - {period.start} to {period.end}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic' }}>No grading periods found. Create one to enable course imports.</p>
        )}
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
          <button onClick={() => postJson('/api/admin/seed', { seed, dryRun })}>Run Seed (Users & Teachers Only)</button>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Bulk Import CSVs (All 3 Students Combined)</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Download CSV files for bulk import into Schoology. These CSVs combine data from Carter, Tazio, and Livio. Upload them at: 
          <a href="https://app.schoology.com/course/import" target="_blank" rel="noopener" style={{ marginLeft: 4, color: '#0066cc' }}>
            Schoology Bulk Import
          </a>
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a 
            href={`/api/admin/seed/csv?type=users`}
            download
            style={{ 
              padding: '8px 12px', 
              background: '#28a745', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 4,
              fontSize: 14
            }}
          >
            👨‍🏫 Download Teachers CSV
          </a>
          <a 
            href={`/api/admin/seed/csv?type=courses`}
            download
            style={{ 
              padding: '8px 12px', 
              background: '#0066cc', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 4,
              fontSize: 14
            }}
          >
            📚 Download Courses CSV
          </a>
          <a 
            href={`/api/admin/seed/csv?type=enrollments`}
            download
            style={{ 
              padding: '8px 12px', 
              background: '#007bff', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            👥 Download Enrollments CSV
          </a>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#fff3cd', borderRadius: 4, fontSize: 13, border: '1px solid #ffc107' }}>
          <strong>⚠️ Critical Settings:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>During upload, you MUST select:
              <ul style={{ paddingLeft: 20 }}>
                <li><strong>School</strong> (your developer sandbox school)</li>
                <li><strong>Grading Periods</strong> (create one first using "Create Default Grading Period" above if needed)</li>
                <li><strong>Enroll based on:</strong> <span style={{ color: '#d9534f', fontWeight: 'bold' }}>Section School Code</span> (NOT "Section Code"!)</li>
                <li><strong>Enrollment Type:</strong> "Use Import File" → Admin CSV Value=1, Member CSV Value=2</li>
              </ul>
            </li>
            <li>Section codes must be unique across courses and grading periods</li>
            <li>Existing courses (matched by course code) will be reused if found</li>
          </ul>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#f0f7ff', borderRadius: 4, fontSize: 13 }}>
          <strong>Import Order:</strong>
          <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Upload <strong>Courses CSV</strong> (includes sections)</li>
            <li>Upload <strong>All Enrollments CSV</strong> (teachers + students in one file)</li>
          </ol>
          <p style={{ margin: '8px 0', fontSize: 12, color: '#0056b3' }}>
            <strong>Note:</strong> Students use <code>20250929</code>, Teachers use <code>20250930</code>
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Output</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 12, borderRadius: 6 }}>{log}</pre>
      </div>
    </div>
  );
}


