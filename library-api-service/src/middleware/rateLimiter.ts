import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds
const RATE_LIMIT_MAX_REQUESTS = 30; // max requests per window

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next();
    }

    const userId = req.user.sub;
    const key = `rate_limit:${userId}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    if (current > RATE_LIMIT_MAX_REQUESTS) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW} seconds`,
        retryAfter: RATE_LIMIT_WINDOW,
      });
    }

    const ttl = await redis.ttl(key);
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX_REQUESTS - current));
    res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next();
  }
};

