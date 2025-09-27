import { NextRequest } from 'next/server';

describe('Demo session API', () => {
  it('sets demo_session cookie and redirects to /dashboard', async () => {
    const { GET } = await import('@/app/api/demo/start/route');
    const req = new NextRequest('https://example.ngrok-free.app/api/demo/start');
    const res = await GET(req as any);
    expect(res.status).toBe(307);
    const setCookie = res.headers.get('set-cookie') || '';
    expect(setCookie).toMatch(/demo_session=1/);
    expect(res.headers.get('location')).toBe('https://example.ngrok-free.app/dashboard');
  });
});


