import { requestTokenLogic } from '@/functions/schoology-auth.logic';

class FakeDoc { constructor(private store: Map<string, any>, private id: string) {} async set(data: any) { this.store.set(this.id, data); } }
class FakeCollection { constructor(private store: Map<string, any>) {} doc(id: string) { return new FakeDoc(this.store, id); } }
class FakeDb { private tables = new Map<string, Map<string, any>>(); collection(name: string) { if(!this.tables.has(name)) this.tables.set(name, new Map()); return new FakeCollection(this.tables.get(name)!); } }

describe('Authorize URL composition', () => {
  it('includes oauth_callback on /oauth/authorize', async () => {
    // Mock request token endpoint
    (global.fetch as unknown as jest.Mock) = jest.fn().mockResolvedValue({ ok: true, text: async () => 'oauth_token=req_123&oauth_token_secret=req_secret' });
    const db = new FakeDb();
    const cb = 'https://example.ngrok-free.app/api/callback';
    const url = await requestTokenLogic(db as any, 'key', 'secret', cb);
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://app.schoology.com/oauth/authorize');
    expect(parsed.searchParams.get('oauth_token')).toBe('req_123');
    expect(parsed.searchParams.get('oauth_callback')).toBe(cb);
  });
});


