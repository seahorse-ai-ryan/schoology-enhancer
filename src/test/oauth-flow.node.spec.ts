import { server } from '@/mocks/server';
import { rest } from 'msw';

import { requestTokenLogic, callbackLogic } from '@/functions/schoology-auth.logic';

// Minimal in-memory fake for Firestore admin API shape we use
class FakeDoc {
  private store: Map<string, any>;
  private id: string;
  constructor(store: Map<string, any>, id: string) { this.store = store; this.id = id; }
  async set(data: any) { this.store.set(this.id, data); }
  async get() { return { exists: this.store.has(this.id), data: () => this.store.get(this.id) }; }
}

class FakeCollection {
  private store: Map<string, any>;
  constructor(store: Map<string, any>) { this.store = store; }
  doc(id: string) { return new FakeDoc(this.store, id); }
}

class FakeDb {
  private tables = new Map<string, Map<string, any>>();
  collection(name: string) {
    if (!this.tables.has(name)) this.tables.set(name, new Map());
    return new FakeCollection(this.tables.get(name)!);
  }
}

describe('OAuth flow (MSW Node)', () => {
  const db = new FakeDb();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('requestToken includes callback and persists secret, then callback exchanges with verifier', async () => {
    // Override MSW handlers for OAuth token endpoints to deterministic outputs
    server.use(
      rest.get('https://api.schoology.com/v1/oauth/request_token', (req, res, ctx) => {
        // Assert oauth_callback passed
        const url = new URL(req.url.toString());
        expect(url.searchParams.get('oauth_callback')).toBe('https://example.ngrok-free.app/callback');
        return res(ctx.text('oauth_token=req_123&oauth_token_secret=req_secret'));
      }),
      rest.get('https://api.schoology.com/v1/oauth/access_token', (req, res, ctx) => {
        const url = new URL(req.url.toString());
        expect(url.searchParams.get('oauth_verifier')).toBe('ver_789');
        return res(ctx.text('oauth_token=acc_456&oauth_token_secret=acc_secret'));
      }),
      rest.get('https://api.schoology.com/v1/users/me', (_req, res, ctx) => {
        return res(ctx.json({ id: 'u_1', name_display: 'Ryan Hickman' }));
      }),
    );

    const redirect = await requestTokenLogic(db as any, 'key', 'secret', 'https://example.ngrok-free.app/callback');
    expect(redirect).toContain('oauth_token=req_123');

    const result = await callbackLogic(db as any, 'key', 'secret', 'req_123', 'ver_789');
    expect(result.userId).toBe('u_1');
  });
});


