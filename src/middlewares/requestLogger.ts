import { Request, Response, NextFunction } from 'express';
import LoggerInstance from '../loaders/logger';

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestId = (res.locals.requestId as string) ?? '-';
    LoggerInstance.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms [${requestId}]`,
    );
  });

  next();
};

export default requestLoggerMiddleware;
