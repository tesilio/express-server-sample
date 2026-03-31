import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import createApiRoutes from '../api';
import config from '../config';
import { NotFoundError, BaseHttpError } from '../utils/customErrors';
import requestIdMiddleware from '../middlewares/requestId';
import requestLoggerMiddleware from '../middlewares/requestLogger';
import setupSwagger from './swagger';
import IndexService from '../services/IndexService';
import IssueCouponService from '../services/IssueCouponService';

interface ExpressLoaderDeps {
  app: express.Application;
  indexService: IndexService;
  issueCouponService: IssueCouponService;
}

const couponRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: config.rateLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      status: 429,
      name: 'TooManyRequestsError',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      errorCode: 'ERR000007',
      data: null,
    },
  },
});

const expressLoader = ({ app, indexService, issueCouponService }: ExpressLoaderDeps): void => {
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  setupSwagger(app);

  app.get('/status', (_req, res) => {
    res.status(200).end();
  });
  app.head('/status', (_req, res) => {
    res.status(200).end();
  });

  app.use('/v1/coupons', couponRateLimiter);
  app.use('/', createApiRoutes({ indexService, issueCouponService }));

  app.all('/*', (_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError({ message: '알 수 없는 요청입니다.', code: 'ERR000000' }));
  });

  app.use((err: BaseHttpError, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status ?? 500;
    res.status(status).json({
      error: {
        status,
        name: err.name ?? 'Error',
        message: status >= 500 ? '알 수 없는 에러가 발생했습니다.' : err.message,
        errorCode: err.code ?? '',
        data: err.data ?? null,
      },
    });
  });
};

export default expressLoader;
