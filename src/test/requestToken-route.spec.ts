import { NextRequest } from 'next/server';

jest.mock('@/functions/schoology-auth.logic', () => ({
  requestTokenLogic: jest.fn().mockResolvedValue('https://app.schoology.com/oauth/authorize?oauth_token=req_123'),
}));

describe('/api/requestToken route', () => {
  it('passes callback URL into requestTokenLogic', async () => {
    const { GET } = await import('@/app/api/requestToken/route');
    const { requestTokenLogic } = await import('@/functions/schoology-auth.logic');

    process.env.SCHOOLOGY_CONSUMER_KEY = 'key';
    process.env.SCHOOLOGY_CONSUMER_SECRET = 'secret';

    const req = new NextRequest('https://example.ngrok-free.app/api/requestToken');
    const res = await GET(req as any);
    expect(res.status).toBe(307);
    expect((requestTokenLogic as jest.Mock).mock.calls[0][3]).toBe('https://example.ngrok-free.app/api/callback');
  });
});


