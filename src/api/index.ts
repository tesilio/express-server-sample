import { Router } from 'express';
import createIndexRouter from './v1/index';
import createCouponRouter from './v1/coupons';
import IndexService from '../services/IndexService';
import IssueCouponService from '../services/IssueCouponService';

interface ApiDependencies {
  indexService: IndexService;
  issueCouponService: IssueCouponService;
}

const createApiRoutes = (deps: ApiDependencies): Router => {
  const router = Router();

  router.use('/v1', createIndexRouter(deps.indexService));
  router.use('/v1/coupons', createCouponRouter(deps.issueCouponService));

  return router;
};

export default createApiRoutes;
