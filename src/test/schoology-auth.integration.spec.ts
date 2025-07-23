// src/test/schoology-auth.integration.spec.ts
import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from '@jest/globals';
import { requestTokenLogic, callbackLogic } from '../functions/schoology-auth.logic';

// Create a simple, in-memory mock for the Firestore database.
let fakeDb = {};
const dbMock = {
  collection: (name) => ({
    doc: (id) => ({
      set: (data) => { fakeDb[`${name}/${id}`] = data; return Promise.resolve(); },
      get: () => Promise.resolve({ exists: !!fakeDb[`${name}/${id}`], data: () => fakeDb[`${name}/${id}`] }),
    }),
  }),
};

afterEach(() => {
  fakeDb = {};
});

describe('Schoology OAuth Logic', () => {
  it('requestTokenLogic should return a redirect URL and store a token', async () => {
    const redirectUrl = await requestTokenLogic(dbMock as any, 'key', 'secret');
    expect(redirectUrl).toBe('https://app.schoology.com/oauth/authorize?oauth_token=test_request_token');
    expect(fakeDb['oauth_tokens/test_request_token']).toBeDefined();
  });

  it('callbackLogic should exchange tokens and store user data', async () => {
    // Setup: prime the database with the request token.
    fakeDb['oauth_tokens/test_request_token'] = { secret: 'test_request_secret' };
    
    const result = await callbackLogic(dbMock as any, 'key', 'secret', 'test_request_token');

    expect(result.userId).toBe('schoology_user_123');
    expect(fakeDb['users/schoology_user_123']).toEqual({
      accessToken: 'test_access_token',
      accessSecret: 'test_access_secret',
      name: 'Test User',
    });
  });
});
