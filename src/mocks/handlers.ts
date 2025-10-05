// MSW Request Handlers for Unit Tests
// These mock Schoology API responses for testing OAuth flows

import { http, HttpResponse } from 'msw';

export const handlers = [
  // OAuth request token endpoint
  http.get('https://api.schoology.com/v1/oauth/request_token', ({ request }) => {
    const url = new URL(request.url);
    const callback = url.searchParams.get('oauth_callback');
    
    if (!callback) {
      return new HttpResponse('oauth_callback required', { status: 400 });
    }
    
    return new HttpResponse('oauth_token=test_req_token&oauth_token_secret=test_req_secret', {
      status: 200,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }),

  // OAuth access token endpoint
  http.get('https://api.schoology.com/v1/oauth/access_token', ({ request }) => {
    const url = new URL(request.url);
    const verifier = url.searchParams.get('oauth_verifier');
    
    if (!verifier) {
      return new HttpResponse('oauth_verifier required', { status: 400 });
    }
    
    return new HttpResponse('oauth_token=test_access_token&oauth_token_secret=test_access_secret', {
      status: 200,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }),

  // User profile endpoint
  http.get('https://api.schoology.com/v1/users/me', () => {
    return HttpResponse.json({
      id: 'test_user_123',
      name_display: 'Test User',
      username: 'testuser',
      primary_email: 'test@example.com',
      school_id: 'test_school',
      role_id: 1,
    });
  }),
];

