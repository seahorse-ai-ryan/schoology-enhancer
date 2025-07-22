import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Define your handlers here. A simple example is provided.
export const handlers = [
  http.get('https://api.schoology.com/v1/users/me', () => {
    return HttpResponse.json({
      uid: '12345',
      name_display: 'Test User',
    })
  }),
]

export const server = setupServer(...handlers)
