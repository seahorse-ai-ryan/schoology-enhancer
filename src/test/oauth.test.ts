import { requestTokenLogic, callbackLogic } from '../functions/schoology-auth.logic';

// Mock Firebase Admin
jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        exists: jest.fn(),
        data: jest.fn(),
      })),
    })),
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('OAuth 1.0 Flow', () => {
  const mockDb = {} as any;
  const consumerKey = 'test_consumer_key';
  const consumerSecret = 'test_consumer_secret';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('requestTokenLogic', () => {
    it('should successfully get request token and redirect URL', async () => {
      // Mock successful Schoology response
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('oauth_token=test_token&oauth_token_secret=test_secret'),
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await requestTokenLogic(mockDb, consumerKey, consumerSecret);

      expect(result).toContain('https://app.schoology.com/oauth/authorize');
      expect(result).toContain('oauth_token=test_token');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schoology.com/v1/oauth/request_token',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    it('should throw error when request token fails', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(
        requestTokenLogic(mockDb, consumerKey, consumerSecret)
      ).rejects.toThrow('Request Token failed');
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(
        requestTokenLogic(mockDb, consumerKey, consumerSecret)
      ).rejects.toThrow('Network error');
    });
  });

  describe('callbackLogic', () => {
    it('should successfully exchange request token for access token', async () => {
      // Mock Firestore response for request token
      const mockTokenDoc = {
        exists: true,
        data: () => ({ secret: 'request_token_secret' }),
      };
      
      // Mock Firestore collection and doc methods
      const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockTokenDoc),
          set: jest.fn(),
        })),
      }));
      
      mockDb.collection = mockCollection;

      // Mock successful access token response
      const mockAccessResponse = {
        ok: true,
        text: () => Promise.resolve('oauth_token=access_token&oauth_token_secret=access_secret'),
      };

      // Mock successful user data response
      const mockUserResponse = {
        ok: true,
        json: () => Promise.resolve({ uid: 'user123', name_display: 'Test User' }),
      };

      (global.fetch as any)
        .mockResolvedValueOnce(mockAccessResponse)  // access token call
        .mockResolvedValueOnce(mockUserResponse);  // user data call

      const result = await callbackLogic(mockDb, consumerKey, consumerSecret, 'test_oauth_token');

      expect(result).toEqual({ userId: 'user123' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error when request token not found', async () => {
      const mockTokenDoc = {
        exists: false,
      };
      
      const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockTokenDoc),
        })),
      }));
      
      mockDb.collection = mockCollection;

      await expect(
        callbackLogic(mockDb, consumerKey, consumerSecret, 'invalid_token')
      ).rejects.toThrow('Token not found');
    });

    it('should throw error when access token request fails', async () => {
      const mockTokenDoc = {
        exists: true,
        data: () => ({ secret: 'request_token_secret' }),
      };
      
      const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockTokenDoc),
        })),
      }));
      
      mockDb.collection = mockCollection;

      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);

      await expect(
        callbackLogic(mockDb, consumerKey, consumerSecret, 'test_oauth_token')
      ).rejects.toThrow('Access Token failed');
    });

    it('should throw error when user data fetch fails', async () => {
      const mockTokenDoc = {
        exists: true,
        data: () => ({ secret: 'request_token_secret' }),
      };
      
      const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockTokenDoc),
          set: jest.fn(),
        })),
      }));
      
      mockDb.collection = mockCollection;

      // Mock successful access token response
      const mockAccessResponse = {
        ok: true,
        text: () => Promise.resolve('oauth_token=access_token&oauth_token_secret=access_secret'),
      };

      // Mock failed user data response
      const mockUserResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      (global.fetch as any)
        .mockResolvedValueOnce(mockAccessResponse)
        .mockResolvedValueOnce(mockUserResponse);

      await expect(
        callbackLogic(mockDb, consumerKey, consumerSecret, 'test_oauth_token')
      ).rejects.toThrow('User fetch failed');
    });
  });

  describe('OAuth Signature Generation', () => {
    it('should generate valid OAuth headers', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('oauth_token=test_token&oauth_token_secret=test_secret'),
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);

      await requestTokenLogic(mockDb, consumerKey, consumerSecret);

      // Verify that fetch was called with proper OAuth headers
      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;
      
      expect(headers).toBeInstanceOf(Headers);
      expect(headers.get('Authorization')).toContain('OAuth');
      expect(headers.get('Authorization')).toContain('oauth_consumer_key');
      expect(headers.get('Authorization')).toContain('oauth_signature');
      expect(headers.get('Authorization')).toContain('oauth_timestamp');
      expect(headers.get('Authorization')).toContain('oauth_nonce');
    });
  });
});
