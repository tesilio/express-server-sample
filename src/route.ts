import { Express, Response } from 'express';
import indexRoutes from './index/index.routes';
import couponRoutes from './coupon/coupon.routes';
import customResponse from './middlewares/customResponse';
import { NotFoundError } from './middlewares/error';

export default class Routes {
  constructor(app: Express) {
    app.use('/v1', indexRoutes);
    app.use('/v1/coupons', couponRoutes);
    app.all('/*', () => {
      throw new NotFoundError({ message: '알 수 없는 요청입니다.', code: 'ERR000000' });
    });
    app.use('/*', (err: any, _req: any, res: Response<any, Record<string, any>>, _next: any) => {
      if (process.env.NODE_ENV !== 'production') {
        // todo: logger
        console.error(err);
      }
      Promise.reject(err).catch(customResponse.handleError(res));
    });
  }
}
