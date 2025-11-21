import { Request, Response, NextFunction } from 'express';

export function authPlaceholder(req: Request, res: Response, next: NextFunction) {
  // Placeholder authentication middleware — allow all
  next();
}

export default authPlaceholder;
