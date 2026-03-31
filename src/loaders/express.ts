import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import createApiRoutes from '../api';
import { NotFoundError, BaseHttpError } from '../utils/customErrors';
import IndexService from '../services/IndexService';
import IssueCouponService from '../services/IssueCouponService';

interface ExpressLoaderDeps {
  app: express.Application;
  indexService: IndexService;
  issueCouponService: IssueCouponService;
}

const expressLoader = ({ app, indexService, issueCouponService }: ExpressLoaderDeps): void => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/status', (_req, res) => {
    res.status(200).end();
  });
  app.head('/status', (_req, res) => {
    res.status(200).end();
  });

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
