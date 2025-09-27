import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  response.cookies.set('demo_session', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}


