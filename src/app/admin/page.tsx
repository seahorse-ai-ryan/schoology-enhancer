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
        <h2>Seed Data Management</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          For bulk CSV generation and assignment/grade imports, use the command-line scripts in the <code>/scripts</code> directory.
        </p>
        <div style={{ padding: 12, background: '#f7f7f7', borderRadius: 4, fontSize: 13 }}>
          <strong>Available Scripts:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li><code>node scripts/generate-seed-csvs.js</code> - Generate CSV files for users, courses, enrollments, and parent associations</li>
            <li><code>node scripts/import-assignments-grades.js</code> - Bulk import assignments and grades via Schoology API</li>
          </ul>
          <p style={{ margin: '8px 0', fontSize: 12, color: '#666' }}>
            See <code>docs/guides/BULK-ASSIGNMENT-IMPORT.md</code> for detailed instructions.
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


