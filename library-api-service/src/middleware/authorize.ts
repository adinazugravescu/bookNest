import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const roles = req.user.realm_access?.roles || [];
  if (!roles.includes('admin')) {
    return res.status(403).json({ error: 'Forbidden: Admin role required' });
  }

  next();
};

