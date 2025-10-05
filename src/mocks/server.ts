// MSW Server Setup for Unit Tests Only
// This is used in Jest tests to mock Schoology API responses
// NOT used in the browser or development mode

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

