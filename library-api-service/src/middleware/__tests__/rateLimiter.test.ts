import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../rateLimiter';
import { redis } from '../../config/redis';

// Mock Redis
jest.mock('../../config/redis', () => ({
    redis: {
        incr: jest.fn(),
        expire: jest.fn(),
        ttl: jest.fn(),
    }
}));

describe('Rate Limiter', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            user: {
                sub: 'user123',
                email: 'test@example.com',
                preferred_username: 'testuser',
                realm_access: { roles: ['user'] }
            }
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            setHeader: jest.fn(),
        };

        nextFunction = jest.fn();
    });

    it('should allow request when under rate limit', async () => {
        (redis.incr as jest.Mock).mockResolvedValue(5);
        (redis.ttl as jest.Mock).mockResolvedValue(45);

        await rateLimiter(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(redis.incr).toHaveBeenCalledWith('rate_limit:user123');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 30);
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 25);
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should set expire on first request', async () => {
        (redis.incr as jest.Mock).mockResolvedValue(1);
        (redis.ttl as jest.Mock).mockResolvedValue(60);

        await rateLimiter(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(redis.expire).toHaveBeenCalledWith('rate_limit:user123', 60);
    });

    it('should block request when rate limit exceeded', async () => {
        (redis.incr as jest.Mock).mockResolvedValue(31); // Over limit
        (redis.ttl as jest.Mock).mockResolvedValue(30);

        await rateLimiter(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(429);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Too many requests',
                message: expect.stringContaining('Rate limit exceeded')
            })
        );
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle different users independently', async () => {
        (redis.incr as jest.Mock)
            .mockResolvedValueOnce(5)  // First user
            .mockResolvedValueOnce(10); // Second user
        (redis.ttl as jest.Mock).mockResolvedValue(45);

        const mockRequest2 = {
            ...mockRequest,
            user: { ...mockRequest.user!, sub: 'user456' }
        };

        await rateLimiter(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        await rateLimiter(
            mockRequest2 as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(redis.incr).toHaveBeenCalledWith('rate_limit:user123');
        expect(redis.incr).toHaveBeenCalledWith('rate_limit:user456');
    });

    it('should pass through if no user in request', async () => {
        mockRequest.user = undefined;

        await rateLimiter(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(redis.incr).not.toHaveBeenCalled();
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
        (redis.incr as jest.Mock).mockRejectedValue(new Error('Redis error'));

        await rateLimiter(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        // Should continue even if Redis fails
        expect(nextFunction).toHaveBeenCalled();
    });
});

