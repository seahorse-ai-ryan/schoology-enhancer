// src/test/schoology-auth.integration.spec.ts
import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from '@jest/globals';
import { requestTokenLogic, callbackLogic } from '../functions/schoology-auth.logic';

// Create a simple, in-memory mock for the Firestore database.
let fakeDb: Record<string, any> = {};
const dbMock = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: (data: any) => { fakeDb[`${name}/${id}`] = data; return Promise.resolve(); },
      get: () => Promise.resolve({ exists: !!fakeDb[`${name}/${id}`], data: () => fakeDb[`${name}/${id}`] }),
    }),
  }),
};

afterEach(() => {
  fakeDb = {};
});

describe('Schoology OAuth Logic', () => {
  it('requestTokenLogic should return a redirect URL and store a token', async () => {
    const callbackUrl = 'https://example.com/callback';
    const redirectUrl = await requestTokenLogic(dbMock as any, 'key', 'secret', callbackUrl);
    expect(redirectUrl).toContain('https://app.schoology.com/oauth/authorize');
    expect(redirectUrl).toContain('oauth_token');
    // Token should be stored in fake DB
    const tokenKeys = Object.keys(fakeDb).filter(k => k.startsWith('oauth_tokens/'));
    expect(tokenKeys.length).toBeGreaterThan(0);
  });

  it('callbackLogic should exchange tokens and store user data', async () => {
    // Setup: prime the database with the request token.
    fakeDb['oauth_tokens/test_request_token'] = { secret: 'test_request_secret' };
    
    const result = await callbackLogic(dbMock as any, 'key', 'secret', 'test_request_token', 'test_verifier');

    expect(result.userId).toBeDefined();
    expect(result.name).toBeDefined();
    // User should be stored in fake DB
    const userKeys = Object.keys(fakeDb).filter(k => k.startsWith('users/'));
    expect(userKeys.length).toBeGreaterThan(0);
  });
});
