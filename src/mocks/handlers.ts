
import { http, HttpResponse } from 'msw';

// Define the handlers for the Schoology API
export const handlers = [
  // Mock for the request_token endpoint
  http.get('https://api.schoology.com/v1/oauth/request_token', () => {
    return HttpResponse.text('oauth_token=test_request_token&oauth_token_secret=test_request_secret');
  }),

  // Mock for the access_token endpoint
  http.get('https://api.schoology.com/v1/oauth/access_token', () => {
    return HttpResponse.text('oauth_token=test_access_token&oauth_token_secret=test_access_secret');
  }),

  // Mock for the users/me endpoint
  http.get('https://api.schoology.com/v1/users/me', () => {
    return HttpResponse.json({ uid: 'schoology_user_123', name_display: 'Test User' });
  }),
];
