import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

const CACHE_TTL = 300; // 5 minutes in seconds

export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      if (res.statusCode === 200) {
        redis.setex(key, CACHE_TTL, JSON.stringify(body));
      }
      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('Cache middleware error:', error);
    next();
  }
};

export const invalidateCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

