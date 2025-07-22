import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import * as functions from '../functions/schoology-auth';

// Mock Firebase Functions modules
vi.mock('firebase-functions/logger', () => ({
    info: vi.fn(),
    error: vi.fn(),
}));
vi.mock('firebase-functions/v2/https', () => ({
    onRequest: (options, handler) => handler, // Return the handler directly
}));

// Mock Firestore
const set = vi.fn();
const doc = vi.fn(() => ({ set }));
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc,
    }),
  }),
}));
vi.mock('firebase-admin/app', () => ({
  initializeApp: () => {},
}));


// 1. Define the mock server and its handlers
const server = setupServer(
  http.get('https://api.schoology.com/v1/oauth/request_token', () => {
    return HttpResponse.text(
      'oauth_token=test_request_token&oauth_token_secret=test_request_secret'
    )
  }),
  http.get('https://api.schoology.com/v1/oauth/access_token', () => {
    return HttpResponse.text(
      'oauth_token=test_access_token&oauth_token_secret=test_access_secret'
    )
  })
)

// 2. Setup and Teardown for the mock server
beforeAll(() => server.listen())
afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
})
afterAll(() => server.close())

// 3. The actual test suite
describe('Schoology OAuth Integration', () => {
  it('should handle the requestToken step correctly', async () => {
    const req = { }; // Mock request object
    const res = { redirect: vi.fn() }; // Mock response object

    await functions.requestToken(req as any, res as any);

    // Assert: Check if the redirect function was called with the correct URL
    expect(res.redirect).toHaveBeenCalledWith(
      'https://app.schoology.com/oauth/authorize?oauth_token=test_request_token'
    );
    
    // Assert: Check if the request token was saved to Firestore
    expect(doc).toHaveBeenCalledWith('test_request_token');
    expect(set).toHaveBeenCalledWith({
        secret: 'test_request_secret',
        timestamp: expect.any(Number),
    });

  });

  it.todo('should handle the full three-legged OAuth 1.0a flow');

});
