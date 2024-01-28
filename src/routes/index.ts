import { Express } from 'express';
import indexRoutes from './index.routes';
import couponRoutes from './coupon.routes';

export default class Routes {
  constructor(app: Express) {
    app.use('/v1', indexRoutes);
    app.use('/v1/coupons', couponRoutes);
  }
}
