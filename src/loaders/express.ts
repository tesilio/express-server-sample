import { Container } from 'typedi';
import express, { Response } from 'express';
import cors from 'cors';
import apiRoutes from '../api';
import { NotFoundError } from '../utils/customErrors';
import customResponse from '../utils/customResponse';
import { Logger } from 'winston';

/**
 * Express 설정
 * @param {e.Application} app
 */
export default ({ app }: { app: express.Application }): void => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get('/status', (_req, res) => {
    res.status(200).end();
  });
  app.head('/status', (_req, res) => {
    res.status(200).end();
  });
  app.use('/', apiRoutes());
  app.all('/*', () => {
    throw new NotFoundError({ message: '알 수 없는 요청입니다.', code: 'ERR000000' });
  });
  app.use('/*', (err: any, _req: any, res: Response<any, Record<string, any>>, _next: any) => {
    if (process.env.NODE_ENV !== 'production') {
      const logger: Logger = Container.get('logger');
      logger.error(err);
    }
    Promise.reject(err).catch(customResponse.handleError(res));
  });
};
