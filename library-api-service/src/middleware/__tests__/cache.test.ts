import { Request, Response, NextFunction } from 'express';
import { cacheMiddleware, invalidateCache } from '../cache';
import { redis } from '../../config/redis';

// Mock Redis
jest.mock('../../config/redis', () => ({
    redis: {
        get: jest.fn(),
        setex: jest.fn(),
        keys: jest.fn(),
        del: jest.fn(),
    }
}));

describe('Cache Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            originalUrl: '/books',
        };

        mockResponse = {
            statusCode: 200,
            setHeader: jest.fn(),
            json: jest.fn(),
        };

        nextFunction = jest.fn();
    });

    it('should return cached response on cache HIT', async () => {
        const cachedData = { books: [{ id: '1', title: 'Test Book' }] };
        (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

        await cacheMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(redis.get).toHaveBeenCalledWith('cache:/books');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
        expect(mockResponse.json).toHaveBeenCalledWith(cachedData);
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should proceed and cache response on cache MISS', async () => {
        (redis.get as jest.Mock).mockResolvedValue(null);
        (redis.setex as jest.Mock).mockResolvedValue('OK');

        await cacheMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(redis.get).toHaveBeenCalledWith('cache:/books');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
        expect(nextFunction).toHaveBeenCalled();

        // Simulate response being sent - res.json was replaced by middleware
        const responseData = { books: [] };
        await (mockResponse.json as any)(responseData);

        // Verify that cache was set when response was sent
        expect(redis.setex).toHaveBeenCalledWith(
            'cache:/books',
            300,
            JSON.stringify(responseData)
        );
    });

    it('should not cache non-200 responses', async () => {
        (redis.get as jest.Mock).mockResolvedValue(null);
        mockResponse.statusCode = 404;

        await cacheMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();

        const responseData = { error: 'Not found' };
        const jsonFunction = mockResponse.json as jest.Mock;
        jsonFunction(responseData);

        // Should not cache 404 responses
        expect(redis.setex).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
        (redis.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

        await cacheMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Should continue even if Redis fails
        expect(nextFunction).toHaveBeenCalled();
    });
});

describe('Cache Invalidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should invalidate cache keys matching pattern', async () => {
        const matchingKeys = ['cache:/books', 'cache:/books?search=test'];
        (redis.keys as jest.Mock).mockResolvedValue(matchingKeys);

        await invalidateCache('/books*');

        expect(redis.keys).toHaveBeenCalledWith('cache:/books*');
        expect(redis.del).toHaveBeenCalledWith(...matchingKeys);
    });

    it('should handle no matching keys', async () => {
        (redis.keys as jest.Mock).mockResolvedValue([]);

        await invalidateCache('/books*');

        expect(redis.keys).toHaveBeenCalledWith('cache:/books*');
        expect(redis.del).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
        (redis.keys as jest.Mock).mockRejectedValue(new Error('Redis error'));

        // Should not throw
        await expect(invalidateCache('/books*')).resolves.not.toThrow();
    });
});

