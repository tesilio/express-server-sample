import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const requestIdMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  const requestId = randomUUID();
  res.setHeader('X-Request-Id', requestId);
  res.locals.requestId = requestId;
  next();
};

export default requestIdMiddleware;
